import type { Metadata } from 'next';
import { brand } from '@/lib/config';
import { StoreProvider } from '@/components/store';
import { Header, Footer } from '@/components/shell';
import { WhatsAppButton } from '@/components/whatsapp-button';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL(brand.url), title: { default: `${brand.name} — El lujo de sentirte tú`, template: `%s | ${brand.name}` }, description: brand.description, openGraph: { title: brand.name, description: brand.description, locale: 'es_CO', type: 'website', images: ['/images/editorial-hero.webp'] } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body><StoreProvider><a href="#main-content" className="skip-link">Ir al contenido</a><Header /><main id="main-content">{children}</main><Footer /><WhatsAppButton /></StoreProvider></body></html>; }

