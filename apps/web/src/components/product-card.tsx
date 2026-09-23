'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { money } from '@/lib/config';
import { useStore } from './store';
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { favorites, toggleFavorite } = useStore();
  const available = product.variants.some(v => v.stock > 0);
  const colors = [...new Map(product.variants.map(v => [v.color, v.colorHex])).entries()];
  return <article className="product-card"><div className="product-photo"><Link href={`/producto/${product.slug}`} aria-label={`Ver ${product.name}`}><Image src={product.images[0]?.url || '/images/dress.jpg'} alt={product.images[0]?.alt || product.name} fill priority={priority} sizes="(max-width: 600px) 46vw, (max-width: 900px) 30vw, 23vw" /></Link><span className={`product-badge ${!available ? 'sold-out' : ''}`}>{!available ? 'AGOTADO' : product.isNew ? 'NUEVO' : product.compareAtPrice ? 'PRECIO ESPECIAL' : 'SELECCIÓN LUXE'}</span><button className={`favorite-button ${favorites.includes(product.id) ? 'selected' : ''}`} aria-label={`${favorites.includes(product.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${product.name}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product)}><Heart size={18} strokeWidth={1.4} /></button><Link className="product-explore" href={`/producto/${product.slug}`}>Descubrir la pieza <ArrowUpRight size={17} /></Link></div><div className="product-meta"><span className="eyebrow">{product.category.name}</span><Link href={`/producto/${product.slug}`}><h3>{product.name}</h3></Link><div className="product-price"><span>{money(product.price)}</span>{product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}</div><div className="product-colors" aria-label={`Colores: ${colors.map(([color]) => color).join(', ')}`}>{colors.map(([color, hex]) => <span key={color} title={color} style={{ backgroundColor: hex }} />)}</div></div></article>;
}
