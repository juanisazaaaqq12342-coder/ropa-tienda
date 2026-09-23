import { Injectable, Inject, UnauthorizedException, BadRequestException, ForbiddenException, ServiceUnavailableException, Controller, Get, Post, Body, Req, Res, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { Database } from './database';
import { MailService } from './mail';
import { appConfig } from './config';
import { parse } from './domain';
export type SafeUser=Pick<User,'id'|'name'|'email'|'phone'|'role'>;
export type AuthedRequest=Request & {user?:SafeUser};
export function publicUser(user:User):SafeUser{return{id:user.id,name:user.name,email:user.email,phone:user.phone,role:user.role};}
export function requireUser(req:AuthedRequest){if(!req.user)throw new UnauthorizedException('Inicia sesión para continuar.');return req.user;}
export function requireStaff(req:AuthedRequest,admin=false){const u=requireUser(req);if(u.role!=='ADMIN'&&(admin||u.role!=='EMPLOYEE'))throw new ForbiddenException('No tienes permiso para esta acción.');return u;}
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
const password=z.string().min(8,'Usa al menos 8 caracteres.').max(72);
const email=z.string().trim().toLowerCase().email().max(254);
const cookieOptions={httpOnly:true,secure:appConfig.production,sameSite:'lax' as const,path:'/'};
@Injectable()
export class AuthService{
  constructor(@Inject(Database) private readonly db:Database,@Inject(MailService) private readonly mail:MailService){}
  async identify(req:AuthedRequest){const token=req.cookies?.luxe_session as string|undefined;if(!token)return;const s=await this.db.session.findUnique({where:{id:digest(token)},include:{user:true}});if(s&&s.expiresAt>new Date()&&s.user.active)req.user=publicUser(s.user);}
  async session(user:User,req:AuthedRequest,res:Response){
    const token=randomBytes(32).toString('base64url');await this.db.session.create({data:{id:digest(token),userId:user.id,expiresAt:new Date(Date.now()+30*86400000)}});
    res.cookie('luxe_session',token,{...cookieOptions,maxAge:30*86400000});
    await this.mergeCart(user.id,req.cookies?.luxe_cart as string|undefined);res.clearCookie('luxe_cart',cookieOptions);return{user:publicUser(user)};
  }
  private async mergeCart(userId:string,guestId?:string){
    if(!guestId)return;
    await this.db.$transaction(async tx=>{
      const guest=await tx.cart.findUnique({where:{id:guestId},include:{items:{include:{variant:true}}}});if(!guest||guest.userId)return;
      const cart=await tx.cart.upsert({where:{userId},create:{userId},update:{}});
      for(const item of guest.items){const existing=await tx.cartItem.findUnique({where:{cartId_variantId:{cartId:cart.id,variantId:item.variantId}}});const quantity=Math.min(99,item.variant.stock,item.quantity+(existing?.quantity||0));if(quantity>0)await tx.cartItem.upsert({where:{cartId_variantId:{cartId:cart.id,variantId:item.variantId}},create:{cartId:cart.id,variantId:item.variantId,quantity},update:{quantity}});}
      await tx.cart.delete({where:{id:guestId}});
    });
  }
  async register(body:unknown,req:AuthedRequest,res:Response){const v=parse(z.object({name:z.string().trim().min(2).max(120),email,password,phone:z.string().max(25).optional()}),body);if(await this.db.user.findUnique({where:{email:v.email}}))throw new BadRequestException('No se pudo crear la cuenta con este correo.');const user=await this.db.user.create({data:{name:v.name,email:v.email,phone:v.phone,passwordHash:await hash(v.password,12)}});return this.session(user,req,res);}
  async login(body:unknown,req:AuthedRequest,res:Response){const v=parse(z.object({email,password:z.string().max(72)}),body);const user=await this.db.user.findUnique({where:{email:v.email}});const valid=await compare(v.password,user?.passwordHash||'$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW');if(!user||!user.active||!valid)throw new UnauthorizedException('Correo o contraseña incorrectos.');return this.session(user,req,res);}
  async logout(req:AuthedRequest,res:Response){const token=req.cookies?.luxe_session as string|undefined;if(token)await this.db.session.deleteMany({where:{id:digest(token)}});res.clearCookie('luxe_session',cookieOptions);return{ok:true};}
  async forgot(body:unknown){const v=parse(z.object({email}),body);const user=await this.db.user.findUnique({where:{email:v.email}});if(user?.active){const token=randomBytes(32).toString('base64url');await this.db.passwordReset.create({data:{id:digest(token),userId:user.id,expiresAt:new Date(Date.now()+3600000)}});await this.mail.send(user.email,'Restablece tu contraseña — LUXE WOMAN',`Solicitaste cambiar tu contraseña. Este enlace vence en una hora: ${appConfig.appUrl}/restablecer?token=${token}\nSi no lo solicitaste, ignora este mensaje.`).catch(()=>undefined);}return{message:'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.'};}
  async reset(body:unknown){const v=parse(z.object({token:z.string().min(32).max(200),password}),body);const passwordHash=await hash(v.password,12);await this.db.$transaction(async tx=>{const reset=await tx.passwordReset.findUnique({where:{id:digest(v.token)}});if(!reset||reset.usedAt||reset.expiresAt<new Date())throw new BadRequestException('El enlace ha vencido o ya fue utilizado.');const claimed=await tx.passwordReset.updateMany({where:{id:reset.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});if(claimed.count!==1)throw new BadRequestException('El enlace ya fue utilizado.');await tx.user.update({where:{id:reset.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:reset.userId}});});return{message:'Contraseña actualizada. Ya puedes iniciar sesión.'};}
  googleStart(res:Response){if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET)throw new ServiceUnavailableException('El acceso con Google aún no está configurado.');const state=randomBytes(32).toString('hex');res.cookie('luxe_oauth',state,{...cookieOptions,maxAge:600000});const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:`${appConfig.apiUrl}/api/v1/auth/google/callback`,response_type:'code',scope:'openid email profile',state}).toString();res.redirect(url.toString());}
  async googleCallback(query:Record<string,string>,req:AuthedRequest,res:Response){
    const expected=req.cookies?.luxe_oauth as string|undefined;res.clearCookie('luxe_oauth',cookieOptions);if(!expected||!query.state||expected.length!==query.state.length||!timingSafeEqual(Buffer.from(expected),Buffer.from(query.state))||!query.code)throw new BadRequestException('No fue posible verificar el acceso con Google.');
    const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:query.code,client_id:process.env.GOOGLE_CLIENT_ID||'',client_secret:process.env.GOOGLE_CLIENT_SECRET||'',redirect_uri:`${appConfig.apiUrl}/api/v1/auth/google/callback`,grant_type:'authorization_code'})});const token=await response.json() as {access_token?:string};if(!response.ok||!token.access_token)throw new UnauthorizedException('Google no autorizó el acceso.');
    const infoResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`}});const info=await infoResponse.json() as {sub:string,email:string,email_verified:boolean,name:string};if(!infoResponse.ok||!info.email_verified)throw new UnauthorizedException('Tu correo de Google no está verificado.');
    let user=await this.db.user.findUnique({where:{googleId:info.sub}});if(!user){const local=await this.db.user.findUnique({where:{email:info.email.toLowerCase()}});if(local)throw new BadRequestException('Ya existe una cuenta con este correo. Ingresa con tu contraseña.');user=await this.db.user.create({data:{googleId:info.sub,email:info.email.toLowerCase(),name:info.name||info.email}});}if(!user.active)throw new UnauthorizedException('La cuenta no está activa.');await this.session(user,req,res);res.redirect(`${appConfig.appUrl}/cuenta`);
  }
}
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController{
  constructor(@Inject(AuthService) private readonly auth:AuthService){}
  @Get('me') me(@Req() req:AuthedRequest){return{user:req.user||null};}
  @Post('register') register(@Body() body:unknown,@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.auth.register(body,req,res);}
  @Post('login') login(@Body() body:unknown,@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.auth.login(body,req,res);}
  @Post('logout') logout(@Req() req:AuthedRequest,@Res({passthrough:true}) res:Response){return this.auth.logout(req,res);}
  @Post('forgot-password') forgot(@Body() body:unknown){return this.auth.forgot(body);}
  @Post('reset-password') reset(@Body() body:unknown){return this.auth.reset(body);}
  @Get('google') google(@Res() res:Response){this.auth.googleStart(res);}
  @Get('google/callback') callback(@Query() query:Record<string,string>,@Req() req:AuthedRequest,@Res() res:Response){return this.auth.googleCallback(query,req,res);}
}
