'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import { useStore } from './store';

export function WhatsAppButton() {
  const { settings } = useStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Raw phone cleaned of non-digits
  const rawPhone = settings?.contactPhone?.replace(/\D/g, '') || '3001234567';
  const fullPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`;

  // Tailor message to current location
  let defaultMessage = 'Hola LUXE WOMAN, me gustaría recibir asesoría personalizada sobre sus prendas y colecciones.';
  if (pathname.startsWith('/producto/')) {
    defaultMessage = 'Hola LUXE WOMAN, estoy viendo esta prenda en la boutique y deseo asesoría sobre tallas y disponibilidad.';
  } else if (pathname === '/checkout') {
    defaultMessage = 'Hola LUXE WOMAN, estoy finalizando mi compra y tengo una pregunta sobre el pago por transferencia.';
  } else if (pathname === '/catalogo') {
    defaultMessage = 'Hola LUXE WOMAN, me gustaría asesoría para encontrar una prenda ideal.';
  }

  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(defaultMessage)}`;

  // Automatically show greeting prompt after 3 seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside className="whatsapp-floating-container" aria-label="Atención por WhatsApp">
      {isOpen && !dismissed && (
        <div className="whatsapp-bubble" role="dialog" aria-label="Asesoría personalizada">
          <div className="whatsapp-bubble-header">
            <div className="whatsapp-agent-info">
              <span className="whatsapp-agent-avatar">LW</span>
              <div>
                <strong>LUXE WOMAN · Asesoría</strong>
                <span className="whatsapp-agent-status">En línea · Respuesta rápida</span>
              </div>
            </div>
            <button
              className="whatsapp-bubble-close"
              aria-label="Cerrar mensaje"
              onClick={() => setDismissed(true)}
            >
              <X size={14} />
            </button>
          </div>
          <p className="whatsapp-bubble-body">
            ¡Hola! ✨ ¿Tienes dudas con tu talla o deseas atención personalizada? Escríbenos directamente a WhatsApp.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-bubble-action"
            onClick={() => setDismissed(true)}
          >
            Iniciar conversación en WhatsApp
          </a>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Escribir por WhatsApp a LUXE WOMAN"
        title="Chatea con nosotras por WhatsApp"
      >
        <span className="whatsapp-btn-pulse" />
        <svg
          className="whatsapp-icon"
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.277-.1-.478-.15-.68.15-.202.3-.779.98-.956 1.18-.176.2-.353.226-.654.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.502.101-.201.05-.376-.025-.526-.075-.15-.68-1.637-.932-2.242-.245-.589-.494-.509-.68-.519l-.579-.01c-.201 0-.527.075-.803.376-.277.301-1.055 1.03-1.055 2.513 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.15 4.555.72.311 1.282.497 1.72.636.724.23 1.382.198 1.903.12.58-.088 1.782-.728 2.033-1.431.251-.703.251-1.306.176-1.431-.075-.125-.276-.201-.577-.351z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182c-1.628 0-3.14-.492-4.407-1.336l-.316-.21-3.267.857.872-3.184-.23-.334A8.152 8.152 0 0 1 3.818 12C3.818 7.49 7.49 3.818 12 3.818 16.51 3.818 20.182 7.49 20.182 12 20.182 16.51 16.51 20.182 12 20.182z" />
        </svg>
        <span className="whatsapp-btn-label">Asesoría WhatsApp</span>
      </a>
    </aside>
  );
}
