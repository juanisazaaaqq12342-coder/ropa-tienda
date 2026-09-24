'use client';

import { useStore } from './store';


export function HelpContent() {
  const { settings } = useStore();
  const rawPhone = settings?.contactPhone?.replace(/\D/g, '') || '3001234567';
  const fullPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`;
  const phoneDisplay = settings?.contactPhone || '+57 300 123 4567';
  const emailDisplay = settings?.contactEmail || 'contacto@luxewoman.com.co';

  return (
    <div className="page-shell prose">
      <span className="eyebrow">ESTAMOS PARA TI</span>
      <h1>Los pequeños detalles</h1>

      <section id="envios">
        <h2>Envíos y entregas</h2>
        <p>
          En <strong>{settings?.brandName || 'LUXE WOMAN'}</strong> realizamos envíos seguros a toda Colombia mediante Coordinadora, Interrapidísimo o mensajería directa en ciudades principales. El costo y el tiempo estimado se calculan automáticamente en tu bolsa. Puedes consultar el número de guía y el seguimiento de tu paquete en todo momento desde tu cuenta.
        </p>
        <p>
          {settings?.freeShippingThreshold
            ? `¡Disfruta de envío gratis en compras superiores a $${settings.freeShippingThreshold.toLocaleString('es-CO')} COP!`
            : 'Contamos con opciones de envío asegurado para tus piezas.'}
        </p>
      </section>

      <section id="cambios">
        <h2>Cambios y devoluciones</h2>
        <p>
          Queremos que ames cada prenda que elijas. Si necesitas realizar un cambio de talla o referencia, dispones de hasta <strong>30 días calendario</strong> posteriores a la entrega para solicitarlo. Las prendas deben estar en su estado original, sin usar, con etiquetas intactas y en su empaque.
        </p>
        <p>
          Conforme al Estatuto del Consumidor en Colombia (Ley 1480 de 2011), cuentas con el derecho de retracto dentro de los primeros 5 días hábiles siguientes a la entrega de tu pedido.
        </p>
      </section>

      <section id="tallas">
        <h2>Encuentra tu talla ideal</h2>
        <p>
          Cada diseño cuenta con especificaciones de medidas y calce en su ficha de producto. Si tienes dudas entre dos tallas, o deseas saber cómo se adapta a tu silueta, nuestro equipo está listo para asesorarte en tiempo real por WhatsApp.
        </p>
      </section>

      <section id="pagos">
        <h2>Pagos y transferencias</h2>
        <p>
          Aceptamos transferencias directas por <strong>Nequi</strong> y <strong>Daviplata</strong>. Al completar tu pedido, verás los datos de cuenta y titular de la boutique. Una vez hecha la transferencia, sube la captura de pantalla de tu comprobante en el detalle de tu pedido para que sea verificado y preparado para despacho.
        </p>
      </section>

      <section id="contacto">
        <h2>Atención y asesoría personalizada</h2>
        <p>
          ¿Prefieres comprar con la ayuda de una asesora, consultar fotos reales de una prenda o conocer el estado de tu pedido? Estamos disponibles para ti:
        </p>
        <p>
          📱 <strong>WhatsApp Oficial:</strong>{' '}
          <a
            href={`https://wa.me/${fullPhone}?text=${encodeURIComponent('Hola LUXE WOMAN, deseo asesoría personalizada con una prenda.')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {phoneDisplay} (Clic para chatear)
          </a>
          <br />
          ✉️ <strong>Correo electrónico:</strong>{' '}
          <a href={`mailto:${emailDisplay}`}>{emailDisplay}</a>
        </p>
      </section>
    </div>
  );
}
