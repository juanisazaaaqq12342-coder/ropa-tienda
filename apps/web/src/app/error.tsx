'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <div className="page-shell empty-state"><span className="eyebrow">VOLVAMOS A INTENTARLO</span><h1 className="page-title">Un pequeño contratiempo</h1><p>No pudimos cargar esta parte de la boutique. Intenta de nuevo en un momento.</p><button className="button" onClick={reset}>Intentar de nuevo</button><Link className="text-link" href="/">Volver al inicio</Link></div>; }
