import { Injectable, Inject, Controller, Get, Post, Patch, Delete, Body, Param, Req, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { Response } from 'express';
import { Database } from './database';
import { AuthedRequest } from './auth';
import { CatalogService, productInclude } from './catalog';
import { appConfig } from './config';
import { parse, totals } from './domain';
export const cartInclude={items:{include:{variant:{include:{product:{include:productInclude}}}},orderBy:{id:'asc' as const}}};
@Injectable()
export class CartService{
  constructor(@Inject(Database) private readonly db:Database,@Inject(CatalogService) private readonly catalog:CatalogService){}
  async resolve(req:AuthedRequest,res:Response){if(req.user){const cart=await this.db.cart.upsert({where:{userId:req.user.id},create:{userId:req.user.id},update:{}});return cart.id;}const cookie=req.cookies?.luxe_cart as string|undefined;const existing=cookie?await this.db.cart.findFirst({where:{id:cookie,userId:null}}):null;if(existing)return existing.id;const cart=await this.db.cart.create({data:{}});res.cookie('luxe_cart',cart.id,{httpOnly:true,sameSite:'lax',secure:appConfig.production,path:'/',maxAge:30*86400000});return cart.id;}
  async get(cartId:string){const cart=await this.db.cart.findUniqueOrThrow({where:{id:cartId},include:cartInclude});const settings=await this.catalog.settings();return{...cart,items:cart.items.map(i=>({...i,lineTotal:i.variant.product.price*i.quantity})),...totals(cart.items.map(i=>({price:i.variant.product.price,quantity:i.quantity})),settings)};}
  async add(cartId:string,body:unknown){const v=parse(z.object({variantId:z.string().min(1).max(100),quantity:z.number().int().min(1).max(99)}),body);await this.db.$transaction(async tx=>{const variant=await tx.productVariant.findUnique({where:{id:v.variantId},include:{product:true}});if(!variant?.product.active)throw new NotFoundException('La variante no está disponible.');const existing=await tx.cartItem.findUnique({where:{cartId_variantId:{cartId,variantId:v.variantId}}});const quantity=v.quantity+(existing?.quantity||0);if(quantity>variant.stock||quantity>99)throw new BadRequestException('No hay suficiente stock para esta cantidad.');await tx.cartItem.upsert({where:{cartId_variantId:{cartId,variantId:v.variantId}},create:{cartId,variantId:v.variantId,quantity},update:{quantity}});});return this.get(cartId);}
  async update(cartId:string,id:string,body:unknown){const v=parse(z.object({quantity:z.number().int().min(1).max(99)}),body);const item=await this.db.cartItem.findFirst({where:{id,cartId},include:{variant:{include:{product:true}}}});if(!item)throw new NotFoundException('El producto no está en tu bolsa.');if(v.quantity>item.variant.stock||!item.variant.product.active)throw new BadRequestException('No hay suficiente stock para esta cantidad.');await this.db.cartItem.update({where:{id},data:v});return this.get(cartId);}
  async remove(cartId:string,id:string){await this.db.cartItem.deleteMany({where:{id,cartId}});return this.get(cartId);}
}
@ApiTags('Bolsa')
@Controller('cart')
export class CartController{
  constructor(@Inject(CartService) private readonly carts:CartService){}
  @Get() async get(@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.carts.get(await this.carts.resolve(req,res));}
  @Post('items') async add(@Body() body:unknown,@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.carts.add(await this.carts.resolve(req,res),body);}
  @Patch('items/:id') async update(@Param('id') id:string,@Body() body:unknown,@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.carts.update(await this.carts.resolve(req,res),id,body);}
  @Delete('items/:id') async remove(@Param('id') id:string,@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.carts.remove(await this.carts.resolve(req,res),id);}
}
