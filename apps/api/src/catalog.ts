import { Injectable, Inject, Controller, Get, Param, Query, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { Database } from './database';
import { defaultSettings, parse, settingsSchema } from './domain';
export const productInclude={category:true,images:{orderBy:{position:'asc' as const}},variants:{orderBy:{size:'asc' as const}}} satisfies Prisma.ProductInclude;
@Injectable()
export class CatalogService{
  constructor(@Inject(Database) readonly db:Database){}
  async settings(){const config=await this.db.shopConfig.findUnique({where:{id:'main'}});const stored=config?parse(settingsSchema,config.value):defaultSettings;return{...stored,googleEnabled:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET)};}
  async products(query:unknown,admin=false){
    const q=parse(z.object({search:z.string().max(100).optional(),category:z.string().max(80).optional(),size:z.string().max(30).optional(),color:z.string().max(40).optional(),minPrice:z.coerce.number().int().min(0).optional(),maxPrice:z.coerce.number().int().min(0).optional(),inStock:z.enum(['true','false']).optional(),featured:z.enum(['true','false']).optional(),isNew:z.enum(['true','false']).optional(),sort:z.enum(['newest','price-asc','price-desc','name']).default('newest'),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(100).default(12)}),query);
    const where:Prisma.ProductWhereInput={
      ...(!admin?{active:true}:{}),
      ...(q.category?{category:{slug:q.category}}:{}),
      ...(q.search?{OR:[{name:{contains:q.search,mode:'insensitive' as const}},{description:{contains:q.search,mode:'insensitive' as const}}]}:{}),
      ...((q.minPrice!==undefined||q.maxPrice!==undefined)?{price:{gte:q.minPrice,lte:q.maxPrice}}:{}),
      ...(q.featured?{featured:q.featured==='true'}:{}),
      ...(q.isNew?{isNew:q.isNew==='true'}:{}),
      ...((q.size||q.color||q.inStock==='true')?{variants:{some:{...(q.size?{size:q.size}:{}),...(q.color?{color:{equals:q.color,mode:'insensitive' as const}}:{}),...(q.inStock==='true'?{stock:{gt:0}}:{})}}}:{}),
    };
    const orderBy:Prisma.ProductOrderByWithRelationInput=q.sort==='price-asc'?{price:'asc'}:q.sort==='price-desc'?{price:'desc'}:q.sort==='name'?{name:'asc'}:{createdAt:'desc'};
    const [items,total]=await Promise.all([this.db.product.findMany({where,include:productInclude,orderBy,skip:(q.page-1)*q.limit,take:q.limit}),this.db.product.count({where})]);return{items,total,page:q.page,limit:q.limit,pages:Math.max(1,Math.ceil(total/q.limit))};
  }
}
@ApiTags('Catálogo')
@Controller()
export class CatalogController{
  constructor(@Inject(CatalogService) private readonly catalog:CatalogService){}
  @Get('health') async health(){try{await this.catalog.db.$queryRaw`SELECT 1`;return{status:'ok'};}catch(error){console.error('DATABASE_HEALTH_ERROR:',error);throw new ServiceUnavailableException('La base de datos no está disponible.');}}
  @Get('settings') settings(){return this.catalog.settings();}
  @Get('categories') categories(){return this.catalog.db.category.findMany({orderBy:{id:'asc'}});}
  @Get('products') products(@Query() query:unknown){return this.catalog.products(query);}
  @Get('products/:slug') async product(@Param('slug') slug:string){const product=await this.catalog.db.product.findFirst({where:{slug,active:true},include:productInclude});if(!product)throw new NotFoundException('No encontramos este producto.');return product;}
}
