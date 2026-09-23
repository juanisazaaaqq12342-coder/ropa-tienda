export const brand = { name: 'LUXE WOMAN', description: 'Una selección especial de moda, zapatos, bolsos y joyería. Piezas que hablan de ti.', url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' };
export const money = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
