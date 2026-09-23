import type { MetadataRoute } from 'next';
import { brand } from '@/lib/config';
import { serverApi } from '@/lib/api';
import type { ProductList } from '@/lib/types';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const urls: MetadataRoute.Sitemap = ['','/catalogo','/nosotros'].map(path => ({ url: brand.url + path })); let page = 1, pages = 1; try { do { const products = await serverApi<ProductList>(`/products?limit=48&page=${page}`); for (const p of products.items) urls.push({ url: `${brand.url}/producto/${p.slug}` }); pages = products.pages; page++; } while (page <= pages); } catch { /* Static pages remain discoverable during maintenance. */ } return urls; }
