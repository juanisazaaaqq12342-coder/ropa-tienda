import type { Metadata } from 'next';
import { HelpContent } from '@/components/help-content';

export const metadata: Metadata = {
  title: 'Estamos para ti — Centro de Ayuda y Contacto',
  description: 'Envíos nacionales, políticas de cambio, métodos de pago y asesoría por WhatsApp de LUXE WOMAN.'
};

export default function Help() {
  return <HelpContent />;
}

