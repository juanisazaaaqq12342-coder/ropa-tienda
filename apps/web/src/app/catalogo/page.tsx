import type { Metadata } from 'next';
import { serverApi } from '@/lib/api';
import type { ProductList } from '@/lib/types';
import { Catalog } from '@/components/catalog';
export const metadata: Metadata = { title: 'La colección', description: 'Explora nuestra selección de ropa, zapatos, bolsos, joyería y accesorios.' };
export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const query = new URLSearchParams();
  const mapping: Record<string, string> = { categoria: 'category', buscar: 'search', talla: 'size', color: 'color', max: 'maxPrice', min: 'minPrice', disponible: 'inStock', nuevo: 'isNew', orden: 'sort', pagina: 'page' };
  for (const [name, value] of Object.entries(params)) if (typeof value === 'string' && mapping[name]) query.set(mapping[name], value);
  query.set('limit', '12');
  const data = await serverApi<ProductList>(`/products?${query}`);
  return <Catalog data={data} />;
}
