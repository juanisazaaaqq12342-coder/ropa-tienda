import 'reflect-metadata';
import { appConfig, validateEnvironment } from './config';
import { Module, Catch, ArgumentsHost, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { Database } from './database';
import { MailService } from './mail';
import { AuthController, AuthService, type AuthedRequest } from './auth';
import { CatalogController, CatalogService } from './catalog';
import { CartController, CartService } from './cart';
import { AccountController } from './account';
import { OrdersController, OrdersService } from './orders';
import { AdminController } from './admin';
@Module({controllers:[AuthController,CatalogController,CartController,AccountController,OrdersController,AdminController],providers:[Database,MailService,AuthService,CatalogService,CartService,OrdersService]})
export class AppModule{}
@Catch()
class Errors implements ExceptionFilter{
  private readonly logger=new Logger('API');
  catch(error:unknown,host:ArgumentsHost){const ctx=host.switchToHttp();const res=ctx.getResponse<Response>();const req=ctx.getRequest<Request>();let status=500;let message='No pudimos completar tu solicitud. Inténtalo de nuevo.';
    if(error instanceof HttpException){status=error.getStatus();const response=error.getResponse();message=typeof response==='string'?response:((response as {message?:string}).message||message);}
    else if(error instanceof Prisma.PrismaClientKnownRequestError){if(error.code==='P2002'){status=409;message='Ya existe un registro con estos datos.';}else if(error.code==='P2025'){status=404;message='No encontramos el registro solicitado.';}else if(error.code==='P2003'){status=400;message='Uno de los datos relacionados no es válido.';}else if(error.code==='P2034'){status=409;message='Los datos cambiaron durante la operación. Actualiza e inténtalo de nuevo.';}}
    if(status>=500)this.logger.error(JSON.stringify({event:'request_failed',requestId:res.getHeader('X-Request-Id'),path:req.path,errorType:error instanceof Error?error.name:'Unknown'}));
    if(!res.headersSent)res.status(status).json({statusCode:status,message});
  }
}
export async function bootstrap(){
  validateEnvironment();const app=await NestFactory.create(AppModule,{bodyParser:false});
  app.use(helmet());app.use(express.json({limit:'64kb'}));app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' && req.method === 'GET') {
      return res.json({ name: 'LUXE WOMAN API', status: 'online', version: '1.0.0', docs: '/api/docs', health: '/api/v1/health' });
    }
    next();
  });
  app.enableCors({ origin: true, credentials: true });
  const auth=app.get(AuthService);const attempts=new Map<string,{count:number,until:number}>();
  app.use(async(req:AuthedRequest,res:Response,next:NextFunction)=>{
    res.setHeader('X-Request-Id',randomUUID());res.setHeader('Cache-Control','no-store');
    if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin&&appConfig.production&&!req.headers.origin.includes('vercel.app')&&!req.headers.origin.includes('localhost')&&req.headers.origin!==new URL(appConfig.appUrl).origin)return res.status(403).json({statusCode:403,message:'Origen de solicitud no permitido.'});
    if(req.path.startsWith('/api/v1/auth/')&&req.method==='POST'){
      const key=`${req.ip}:${req.path}`;const now=Date.now();const item=attempts.get(key);if(item&&item.until>now){item.count++;if(item.count>15){res.setHeader('Retry-After',Math.ceil((item.until-now)/1000));return res.status(429).json({statusCode:429,message:'Demasiados intentos. Espera unos minutos.'});}}else attempts.set(key,{count:1,until:now+15*60000});
      if(attempts.size>10000)for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);
    }
    try{await auth.identify(req);next();}catch{res.status(503).json({statusCode:503,message:'El servicio no está disponible temporalmente.'});}
  });
  app.setGlobalPrefix('api/v1');app.useGlobalFilters(new Errors());app.enableShutdownHooks();
  SwaggerModule.setup('api/docs',app,SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('LUXE WOMAN').setDescription('Boutique API. Consulta API_CONTRACT.md para DTOs y permisos.').setVersion('1.0').addCookieAuth('luxe_session').build()));
  await app.listen(appConfig.port,'0.0.0.0');Logger.log(`API disponible en http://localhost:${appConfig.port}/api/v1`);
  const mail=app.get(MailService);const db=app.get(Database);
  const deliveryTimer=setInterval(()=>{void db.notification.findMany({where:{sentAt:null},take:20,orderBy:{createdAt:'asc'}}).then(rows=>Promise.all(rows.map(n=>mail.deliver(n.id)))).catch(()=>undefined);},60000);deliveryTimer.unref();
  return app;
}
if(require.main===module)void bootstrap();
