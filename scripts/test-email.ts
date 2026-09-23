import '../apps/api/src/config';
import { MailService } from '../apps/api/src/mail';
import { Database } from '../apps/api/src/database';

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error('Uso: npx tsx scripts/test-email.ts <correo-destinatario>');
    console.error('Ejemplo: npx tsx scripts/test-email.ts mi-correo@gmail.com');
    process.exit(1);
  }

  console.log('=========================================');
  console.log('  LUXE WOMAN - PRUEBA DE ENVÍO DE CORREO');
  console.log('=========================================');
  console.log(`Destinatario: ${to}`);

  if (process.env.RESEND_API_KEY) {
    console.log('Proveedor detectado: Resend (vía REST API HTTPS)');
  } else if (process.env.SMTP_HOST) {
    console.log(`Proveedor detectado: Servidor SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587})`);
  } else {
    console.log('Aviso: No se detectó RESEND_API_KEY ni SMTP_HOST en .env. Se guardará archivo local en .storage/mail.');
  }

  const db = new Database();
  const mailer = new MailService(db);

  try {
    console.log('Enviando mensaje de prueba...');
    await mailer.send(
      to,
      'Bienvenida a LUXE WOMAN — Prueba de Entrega',
      '¡Hola! Si recibes este mensaje, tu servicio de correo transaccional (Resend / Brevo) para la boutique LUXE WOMAN está perfectamente configurado y listo para enviar confirmaciones de compra reales a tus clientas.'
    );
    console.log('\n✓ ¡Correo enviado con éxito!');
  } catch (error) {
    console.error('\n✗ Error al enviar correo:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main();
