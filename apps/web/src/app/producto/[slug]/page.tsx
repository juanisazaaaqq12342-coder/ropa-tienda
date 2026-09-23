import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import type { Product, ProductList } from '@/lib/types';
import { ProductDetail } from '@/components/product-detail';
import { ProductCard } from '@/components/product-card';
import { brand } from '@/lib/config';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; try { const p = await serverApi<Product>(`/products/${encodeURIComponent(slug)}`); return { title: p.name, description: p.description, alternates: { canonical: `/producto/${p.slug}` }, openGraph: { images: p.images.map(i => i.url) } }; } catch { return { title: 'Pieza no encontrada' }; } }
export default async function ProductPage({ params }: Props) {
  const { slug } = await params; let product: Product;
  try { product = await serverApi<Product>(`/products/${encodeURIComponent(slug)}`); } catch { notFound(); }
  const related = await serverApi<ProductList>(`/products?category=${product.category.slug}&limit=5`).catch(() => null);
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.images.map(i => `${brand.url}${i.url}`), offers: { '@type': 'Offer', priceCurrency: 'COP', price: product.price, availability: product.variants.some(v => v.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${brand.url}/producto/${product.slug}` } };
  return <div className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href={`/catalogo?categoria=${product.category.slug}`}>{product.category.name}</Link><span>/</span><span>{product.name}</span></nav><ProductDetail product={product} />{related && related.items.some(p => p.id !== product.id) && <section className="related"><span className="eyebrow">EL COMPLEMENTO PERFECTO</span><h2>También podrías enamorarte de…</h2><div className="product-grid">{related.items.filter(p => p.id !== product.id).slice(0, 4).map(p => <ProductCard product={p} key={p.id} />)}</div></section>}</div>;
}
