'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product, ProductList } from '@/lib/types';
import { useStore } from './store';
import { ProductCard } from './product-card';
export function Favorites() {
  const { favorites, user, loading } = useStore(); const [products, setProducts] = useState<Product[]>([]); const [error, setError] = useState(''); const [fetching, setFetching] = useState(true);
  useEffect(() => { let active = true; async function load() { try { const items: Product[] = []; if (user) items.push(...await api<Product[]>('/favorites')); else { let page = 1; let pages = 1; do { const result = await api<ProductList>(`/products?limit=48&page=${page}`); items.push(...result.items.filter(p => favorites.includes(p.id))); pages = result.pages; page++; } while (page <= pages); } if (active) { setProducts(items); setError(''); } } catch (e) { if (active) setError(e instanceof Error ? e.message : 'No pudimos cargar tus favoritos'); } finally { if (active) setFetching(false); } } if (!loading) void load(); return () => { active = false; }; }, [favorites, user, loading]);
  return <div className="page-shell"><div className="catalog-intro"><span className="eyebrow">ESO QUE TE HACE SONREÍR</span><h1>Mis favoritos</h1><p>Un pequeño universo de piezas que hablan de ti.</p></div>{error ? <p className="error-message" role="alert">{error}</p> : loading || fetching ? <div className="empty-state"><p>Cargando tus piezas favoritas…</p></div> : products.length ? <div className="product-grid" style={{ marginTop: 35 }}>{products.filter(p => favorites.includes(p.id)).map(p => <ProductCard product={p} key={p.id} />)}</div> : <div className="empty-state"><Heart size={42} strokeWidth={1} /><h3>El comienzo de una bonita colección</h3><p>Toca el corazón de las piezas que te encantan y encuéntralas aquí.</p><Link href="/catalogo" className="button">Descubrir la colección</Link></div>}</div>;
}
