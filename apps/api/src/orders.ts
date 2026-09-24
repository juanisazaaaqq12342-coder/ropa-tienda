import { Injectable, Inject, Controller, Get, Post, Body, Param, Req, Res, UploadedFile, UseInterceptors, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import type { Response } from 'express';

import { Database } from './database';
import { AuthedRequest, requireUser } from './auth';
import { CatalogService } from './catalog';
import { cartInclude } from './cart';
import { MailService } from './mail';
import { StorageService } from './storage';
import { appConfig } from './config';
import { addressSchema, paymentMethodSchema, parse, totals, validateProof } from './domain';
export const orderInclude={items:true,proofs:{select:{id:true,originalName:true,status:true,note:true,createdAt:true},orderBy:{createdAt:'desc' as const}},shipment:true,events:{orderBy:{createdAt:'asc' as const}}} satisfies Prisma.OrderInclude;
@Injectable()
export class OrdersService{
  constructor(@Inject(Database) readonly db:Database,@Inject(CatalogService) private readonly catalog:CatalogService,@Inject(MailService) private readonly mail:MailService,@Inject(StorageService) private readonly storage:StorageService){}
  async get(id:string,userId?:string){const order=await this.db.order.findFirst({where:{OR:[{id},{number:id}],...(userId?{userId}:{})},include:orderInclude});if(!order)throw new NotFoundException('No encontramos este pedido.');return order;}

  async checkout(userId:string,body:unknown){
    const v=parse(z.object({address:addressSchema,paymentMethod:paymentMethodSchema,idempotencyKey:z.string().min(16).max(128)}),body);
    const existing=await this.db.order.findUnique({where:{userId_idempotencyKey:{userId,idempotencyKey:v.idempotencyKey}},include:orderInclude});if(existing)return existing;
    const settings=await this.catalog.settings();const method=settings.paymentMethods.find(m=>m.id===v.paymentMethod&&m.enabled);if(!method)throw new BadRequestException('Este método de pago no está disponible.');if(!settings.demoMode&&(!method.number||!method.holder))throw new BadRequestException('Este método de pago todavía no está configurado.');
    for(let attempt=0;attempt<3;attempt++){
      try{
        const order=await this.db.$transaction(async tx=>{
          const duplicate=await tx.order.findUnique({where:{userId_idempotencyKey:{userId,idempotencyKey:v.idempotencyKey}},include:orderInclude});if(duplicate)return duplicate;
          const cart=await tx.cart.findUnique({where:{userId},include:cartInclude});if(!cart?.items.length)throw new BadRequestException('Tu bolsa está vacía.');
          for(const item of cart.items){if(!item.variant.product.active)throw new BadRequestException(`${item.variant.product.name} ya no está disponible.`);const reserved=await tx.productVariant.updateMany({where:{id:item.variantId,stock:{gte:item.quantity}},data:{stock:{decrement:item.quantity}}});if(reserved.count!==1)throw new ConflictException(`No hay suficiente stock de ${item.variant.product.name}. Actualiza tu bolsa.`);}
          const amounts=totals(cart.items.map(i=>({price:i.variant.product.price,quantity:i.quantity})),settings);
          const result=await tx.order.create({data:{number:`LW-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`,userId,idempotencyKey:v.idempotencyKey,address:v.address,paymentMethod:v.paymentMethod,subtotal:amounts.subtotal,shipping:amounts.shipping,total:amounts.total,items:{create:cart.items.map(i=>({variantId:i.variantId,productName:i.variant.product.name,productSlug:i.variant.product.slug,image:i.variant.product.images[0]?.url||'',size:i.variant.size,color:i.variant.color,quantity:i.quantity,unitPrice:i.variant.product.price}))},events:{create:{status:'PENDING_PAYMENT',message:settings.demoMode?'Pedido de demostración creado. No realices transferencias reales.':'Pedido creado. Esperamos tu comprobante de pago.'}}},include:orderInclude});
          await tx.cartItem.deleteMany({where:{cartId:cart.id}});return result;
        },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
        void this.mail.notify(userId,`Recibimos tu pedido ${order.number}`,`Tu pedido ${order.number} por $${order.total.toLocaleString('es-CO')} COP está pendiente de pago. Consulta sus instrucciones en ${appConfig.appUrl}/cuenta/pedidos/${order.id}`).catch(()=>undefined);return order;
      }catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&['P2034','P2002'].includes(error.code)){const retry=await this.db.order.findUnique({where:{userId_idempotencyKey:{userId,idempotencyKey:v.idempotencyKey}},include:orderInclude});if(retry)return retry;if(attempt<2)continue;}throw error;}
    }
    throw new ConflictException('Tu bolsa cambió. Revisa el pedido e inténtalo de nuevo.');
  }
  async proof(id:string,userId:string,file?:Express.Multer.File){
    if(!file)throw new BadRequestException('Selecciona el comprobante que deseas adjuntar.');validateProof(file.buffer,file.mimetype);const order=await this.get(id,userId);if(order.status==='CANCELLED'||!['PENDING','REJECTED'].includes(order.paymentStatus))throw new BadRequestException('Este pedido no está esperando un comprobante.');if(order.proofs.length>=10)throw new BadRequestException('Se alcanzó el máximo de comprobantes. Contacta a la tienda.');
    const uploaded=await this.storage.upload(file,'proofs');const storageKey=uploaded.provider==='local'?uploaded.storageKey:uploaded.url;
    await this.db.$transaction(async tx=>{const updated=await tx.order.updateMany({where:{id:order.id,userId,paymentStatus:{in:['PENDING','REJECTED']},status:{not:'CANCELLED'}},data:{paymentStatus:'UNDER_REVIEW'}});if(updated.count!==1)throw new ConflictException('El pedido cambió. Actualiza la página.');await tx.paymentProof.create({data:{orderId:order.id,storageKey,originalName:path.basename(file.originalname).slice(0,200),mimeType:file.mimetype,size:file.size}});await tx.orderEvent.create({data:{orderId:order.id,status:'UNDER_REVIEW',message:'Comprobante recibido. Nuestro equipo revisará el pago.'}});});
    void this.mail.notify(userId,`Comprobante recibido — ${order.number}`,'Recibimos tu comprobante. Te avisaremos cuando revisemos el pago.').catch(()=>undefined);return this.get(order.id,userId);
  }
}
@ApiTags('Pedidos')
@Controller()
export class OrdersController{
  constructor(@Inject(OrdersService) private readonly orders:OrdersService){}
  @Post('checkout') checkout(@Req() req:AuthedRequest,@Body() body:unknown){return this.orders.checkout(requireUser(req).id,body);}
  @Get('orders') list(@Req() req:AuthedRequest){return this.orders.db.order.findMany({where:{userId:requireUser(req).id},include:orderInclude,orderBy:{createdAt:'desc'}});}
  @Get('orders/:id') get(@Req() req:AuthedRequest,@Param('id') id:string){return this.orders.get(id,requireUser(req).id);}
  @Post('orders/:id/proof') @UseInterceptors(FileInterceptor('file',{limits:{fileSize:5*1024*1024,files:1}})) proof(@Req() req:AuthedRequest,@Param('id') id:string,@UploadedFile() file?:Express.Multer.File){return this.orders.proof(id,requireUser(req).id,file);}
  @Get('proofs/:id/file') async download(@Req() req:AuthedRequest,@Param('id') id:string,@Res() res:Response){const user=requireUser(req);const proof=await this.orders.db.paymentProof.findUnique({where:{id},include:{order:{select:{userId:true}}}});if(!proof)throw new NotFoundException('No encontramos el comprobante.');if(proof.order.userId!==user.id&&user.role!=='ADMIN')throw new ForbiddenException('No tienes acceso a este comprobante.');res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');if(proof.storageKey.startsWith('http://')||proof.storageKey.startsWith('https://'))return res.redirect(proof.storageKey);res.type(proof.mimeType);res.download(path.join(appConfig.storage,'proofs',proof.storageKey),proof.originalName);}

}
