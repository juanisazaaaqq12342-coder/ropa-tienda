import { Injectable, Inject, Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { Database } from './database';
import { appConfig } from './config';
@Injectable()
export class MailService {
  private readonly logger=new Logger('Mail');
  constructor(@Inject(Database) private readonly db:Database){}
  async send(to:string,subject:string,text:string) {
    const from=process.env.SMTP_FROM||process.env.RESEND_FROM||'LUXE WOMAN <onboarding@resend.dev>';
    const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]||char));
    const html=`<!doctype html><html lang="es"><body style="margin:0;background:#FBF8F5;font-family:Arial,sans-serif;color:#1F1A17"><main style="max-width:560px;padding:40px 24px;margin:auto"><h1 style="font-family:Georgia,serif;letter-spacing:3px;font-size:24px">LUXE WOMAN</h1><div style="height:1px;background:#D9BFA9;margin:24px 0"></div><h2 style="font-family:Georgia,serif;font-weight:400">${escape(subject)}</h2><p style="font-size:16px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere">${escape(text)}</p><p style="font-size:12px;color:#746962;margin-top:40px">Este mensaje corresponde a una actividad en tu cuenta LUXE WOMAN.</p></main></body></html>`;

    if(process.env.RESEND_API_KEY){
      const res=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{
          'Authorization':`Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({from,to,subject,text,html})
      });
      if(!res.ok){
        const err=await res.text();
        throw new Error(`Error enviando correo con Resend: ${err}`);
      }
      return;
    }

    if(process.env.SMTP_HOST){
      const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_PORT==='465',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined});
      await transport.sendMail({from,to,subject,text,html});
      return;
    }

    if(!appConfig.production){
      const dir=path.join(appConfig.storage,'mail');await mkdir(dir,{recursive:true});await writeFile(path.join(dir,`${Date.now()}-${randomUUID()}.json`),JSON.stringify({to,subject,text},null,2),{mode:0o600});
    }else throw new Error('Servicio de correo no configurado. Define RESEND_API_KEY o SMTP_HOST en las variables de entorno.');
  }
  async notify(userId:string,subject:string,body:string){
    const notification=await this.db.notification.create({data:{userId,subject,body}});
    await this.deliver(notification.id);
  }
  async deliver(id:string){
    const n=await this.db.notification.findUnique({where:{id},include:{user:true}});if(!n||n.sentAt)return;
    try{await this.send(n.user.email,n.subject,n.body);await this.db.notification.update({where:{id},data:{status:process.env.SMTP_HOST?'SENT':'DEVELOPMENT_FILE',sentAt:new Date()}});}catch{this.logger.warn(JSON.stringify({event:'email_delivery_pending',notificationId:id}));}
  }
}
