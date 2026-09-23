import type { MetadataRoute } from 'next';
import { brand } from '@/lib/config';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: ['/', '/catalogo', '/producto/'], disallow: ['/cuenta', '/checkout', '/admin', '/favoritos', '/api/'] }, sitemap: `${brand.url}/sitemap.xml` }; }
