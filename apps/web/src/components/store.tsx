'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Cart, Product, ShopSettings, User } from '@/lib/types';
type Store = { user: User | null; settings: ShopSettings | null; cart: Cart | null; favorites: string[]; refresh: () => Promise<void>; notify: (message: string, kind?: 'success' | 'error') => void; toggleFavorite: (product: Product) => Promise<void>; addToCart: (variantId: string, quantity?: number) => Promise<void>; cartOpen: boolean; setCartOpen: (open: boolean) => void; loading: boolean };
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => { setToast({ message, kind }); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 5000); }, []);
  const refresh = useCallback(async () => {
    const [auth, basket, shop] = await Promise.all([api<{ user: User | null }>('/auth/me'), api<Cart>('/cart'), api<ShopSettings>('/settings')]);
    setUser(auth.user); setCart(basket); setSettings(shop);
    const local: string[] = JSON.parse(localStorage.getItem('luxe-favorites') || '[]');
    if (auth.user) {
      if (local.length) { await Promise.all(local.map(productId => api('/favorites', { method: 'POST', body: JSON.stringify({ productId }) }))); localStorage.removeItem('luxe-favorites'); }
      setFavorites((await api<Product[]>('/favorites')).map(p => p.id));
    } else setFavorites(local);
  }, []);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await refresh();
      } catch {
        if (active) notify('No pudimos conectar con la boutique. Recarga la página para intentar de nuevo.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refresh, notify]);
  const toggleFavorite = async (product: Product) => {
    const selected = favorites.includes(product.id);
    try {
      if (user) await api(selected ? `/favorites/${product.id}` : '/favorites', { method: selected ? 'DELETE' : 'POST', ...(selected ? {} : { body: JSON.stringify({ productId: product.id }) }) });
      const next = selected ? favorites.filter(id => id !== product.id) : [...favorites, product.id];
      setFavorites(next); if (!user) localStorage.setItem('luxe-favorites', JSON.stringify(next));
      notify(selected ? 'Pieza eliminada de tus favoritos' : 'Guardado en tus favoritos');
    } catch (error) { notify(error instanceof Error ? error.message : 'No pudimos guardar la pieza', 'error'); }
  };
  const addToCart = async (variantId: string, quantity = 1) => {
    const next = await api<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ variantId, quantity }) });
    setCart(next); setCartOpen(true); notify('Una nueva pieza en tu bolsa');
  };
  return <Context.Provider value={{ user, settings, cart, favorites, refresh, notify, toggleFavorite, addToCart, cartOpen, setCartOpen, loading }}>{children}<div className={`toast ${toast ? 'visible' : ''} ${toast?.kind || ''}`} role="status" aria-live="polite">{toast?.message}</div></Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('StoreProvider required'); return value; }
