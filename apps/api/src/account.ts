import { Inject, Controller, Get, Post, Patch, Delete, Body, Param, Req, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Database } from './database';
import { AuthedRequest, requireUser, publicUser } from './auth';
import { productInclude } from './catalog';
import { addressSchema, parse } from './domain';
@ApiTags('Cuenta')
@Controller()
export class AccountController{
  constructor(@Inject(Database) private readonly db:Database){}
  @Patch('account') async update(@Req() req:AuthedRequest,@Body() body:unknown){const user=requireUser(req);const v=parse(z.object({name:z.string().trim().min(2).max(120),phone:z.string().trim().max(25).optional()}),body);return{user:publicUser(await this.db.user.update({where:{id:user.id},data:v}))};}
  @Get('addresses') addresses(@Req() req:AuthedRequest){return this.db.address.findMany({where:{userId:requireUser(req).id},orderBy:{createdAt:'desc'}});}
  @Post('addresses') addAddress(@Req() req:AuthedRequest,@Body() body:unknown){const user=requireUser(req);const v=parse(addressSchema,body);return this.db.address.create({data:{...v,userId:user.id}});}
  @Delete('addresses/:id') async removeAddress(@Req() req:AuthedRequest,@Param('id') id:string){await this.db.address.deleteMany({where:{id,userId:requireUser(req).id}});return{ok:true};}
  @Get('favorites') async favorites(@Req() req:AuthedRequest){const items=await this.db.favorite.findMany({where:{userId:requireUser(req).id,product:{active:true}},include:{product:{include:productInclude}},orderBy:{createdAt:'desc'}});return items.map(i=>i.product);}
  @Post('favorites') async addFavorite(@Req() req:AuthedRequest,@Body() body:unknown){const user=requireUser(req);const v=parse(z.object({productId:z.string().max(100)}),body);if(!await this.db.product.findFirst({where:{id:v.productId,active:true}}))throw new NotFoundException('Producto no disponible.');await this.db.favorite.upsert({where:{userId_productId:{userId:user.id,productId:v.productId}},create:{userId:user.id,productId:v.productId},update:{}});return{ok:true};}
  @Delete('favorites/:productId') async removeFavorite(@Req() req:AuthedRequest,@Param('productId') productId:string){await this.db.favorite.deleteMany({where:{userId:requireUser(req).id,productId}});return{ok:true};}
}
