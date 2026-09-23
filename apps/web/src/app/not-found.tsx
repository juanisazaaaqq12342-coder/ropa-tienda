import Link from 'next/link';
export default function NotFound() { return <div className="page-shell empty-state"><span className="eyebrow">404 · FUERA DE COLECCIÓN</span><h1 className="page-title">Esta página se nos escapó</h1><p>Pero hay un universo de piezas especiales por descubrir.</p><Link className="button" href="/catalogo">Explorar la boutique</Link></div>; }
