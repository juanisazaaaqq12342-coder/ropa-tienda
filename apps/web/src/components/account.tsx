"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, LockKeyhole, LogOut, MapPin, Package, Upload, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import type { Address, Order } from "@/lib/types";
import { useStore } from "@/components/store";
import "./operations.css";

export const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
export const date = (value: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
export const messageOf = (error: unknown) => error instanceof Error ? error.message : "No pudimos completar la solicitud. Intenta de nuevo.";
const statusLabels: Record<string, string> = { PENDING_PAYMENT: "Pendiente de pago", CONFIRMED: "Pago confirmado", PREPARING: "En preparación", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado", PENDING: "Pendiente de comprobante", UNDER_REVIEW: "En revisión", APPROVED: "Pago aprobado", REJECTED: "Comprobante rechazado" };
export function StatusBadge({ status }: { status: string }) { return <span className="operations-status" data-state={status}>{statusLabels[status] || status}</span>; }

export const emptyAddress: Address = { name: "", phone: "", line1: "", line2: "", city: "", department: "", postalCode: "", label: "Casa" };

export function AddressFields({ value, onChange }: { value: Address; onChange: (value: Address) => void }) {
  const field = (key: keyof Address, label: string, autoComplete: string, required = true) => <label className={`field ${key === "line1" || key === "line2" ? "operations-wide" : ""}`} key={key}>{label}<input name={key} value={value[key] || ""} autoComplete={autoComplete} required={required} maxLength={key === "line1" || key === "line2" ? 180 : 100} onChange={(event) => onChange({ ...value, [key]: event.target.value })} /></label>;
  return <div className="form-grid">{field("name", "Nombre de quien recibe", "shipping name")}{field("phone", "Teléfono de contacto", "shipping tel")}{field("line1", "Dirección", "shipping address-line1")}{field("line2", "Apartamento, torre o indicaciones (opcional)", "shipping address-line2", false)}{field("city", "Ciudad / municipio", "shipping address-level2")}{field("department", "Departamento", "shipping address-level1")}{field("postalCode", "Código postal (opcional)", "shipping postal-code", false)}<label className="field">País<input value="Colombia" disabled /></label></div>;
}

export function AuthPanel({ afterLogin }: { afterLogin?: () => void }) {
  const { settings, refresh } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password"), ...(mode === "register" ? { name: form.get("name") } : {}) }) });
      await refresh(); afterLogin?.();
    } catch (error) { setError(messageOf(error)); } finally { setBusy(false); }
  };
  return <div className="auth-layout"><aside className="auth-story"><span className="eyebrow">EL ESTILO EMPIEZA CONTIGO</span><h2>Un espacio<br />solo para ti.</h2><p>Guarda tus favoritos, encuentra tu próxima pieza especial y acompaña cada pedido hasta tu puerta.</p></aside><section className="operations-panel auth-form"><p className="eyebrow">BIENVENIDA A {settings?.brandName || "LA BOUTIQUE"}</p><h1 className="page-title">{mode === "login" ? "Qué bueno verte." : "Tu nueva inspiración."}</h1><p className="muted">{mode === "login" ? "Ingresa a tu cuenta para continuar." : "Crea tu cuenta y encuentra tu propio estilo."}</p><div className="operations-tabs" role="tablist" aria-label="Acceso a tu cuenta"><button role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>Iniciar sesión</button><button role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>Crear cuenta</button></div>{error && <p className="operations-alert" role="alert">{error}</p>}<form onSubmit={submit}>{mode === "register" && <label className="field">Nombre completo<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>}<label className="field">Correo electrónico<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" /></label><label className="field">Contraseña<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} maxLength={128} placeholder={mode === "register" ? "Al menos 8 caracteres" : "Tu contraseña"} /></label>{mode === "login" && <Link className="operations-link" href="/cuenta/recuperar">Olvidé mi contraseña</Link>}{mode === "register" && <p className="muted" style={{ fontSize: 11 }}>Al crear tu cuenta, aceptas nuestros <Link href="/legal/terminos">términos</Link> y conoces nuestra <Link href="/legal/privacidad">política de privacidad</Link>.</p>}<button className="button" disabled={busy}>{busy ? "Un momento…" : mode === "login" ? "INGRESAR" : "CREAR MI CUENTA"}<ArrowRight size={16} /></button></form>{settings?.googleEnabled && <><div className="auth-divider">o continúa con</div><a className="button button-secondary" href="/api/v1/auth/google">Continuar con Google</a></>}<p className="muted" style={{ fontSize: 11, display: "flex", gap: 7, marginTop: 24 }}><LockKeyhole size={13} /> Tu información está protegida.</p></section></div>;
}

export function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [token] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || "" : ""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const form = new FormData(event.currentTarget);
    try { const response = await api<{ message: string }>(`/auth/${reset ? "reset-password" : "forgot-password"}`, { method: "POST", body: JSON.stringify(reset ? { token, password: form.get("password") } : { email: form.get("email") }) }); setSuccess(response.message); } catch (err: unknown) { setError(messageOf(err)); } finally { setBusy(false); }
  };
  return <main className="page-shell operations-shell"><section className="operations-panel" style={{ maxWidth: 520, margin: "0 auto" }}><p className="eyebrow">TU CUENTA</p><h1 className="page-title" style={{ fontSize: 38 }}>{reset ? "Una nueva contraseña." : "Recupera tu acceso."}</h1><p className="muted">{reset ? "Elige una contraseña de al menos 8 caracteres." : "Te enviaremos un enlace para restablecer tu contraseña si el correo está registrado."}</p>{error && <p className="operations-alert" role="alert">{error}</p>}{success && <p className="operations-success" role="status">{success}</p>}<form onSubmit={submit}>{reset ? <label className="field">Nueva contraseña<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label> : <label className="field">Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>}<div className="operations-actions"><button className="button" disabled={busy || (reset && !token)}>{busy ? "Un momento…" : reset ? "GUARDAR CONTRASEÑA" : "ENVIAR ENLACE"}</button><Link className="operations-link" href="/cuenta">Volver al ingreso</Link></div>{reset && !token && <p className="operations-alert">Abre el enlace completo que recibiste por correo para continuar.</p>}</form></section></main>;
}

export function Account() {
  const { user, refresh } = useStore();
  const [tab, setTab] = useState("pedidos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(user));
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const [ordersData, addressesData] = await Promise.all([
          api<Order[]>("/orders"),
          api<Address[]>("/addresses")
        ]);
        if (!cancelled) {
          setOrders(ordersData);
          setAddresses(addressesData);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(messageOf(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);
  const action = async (task: () => Promise<void>) => { setBusy(true); setError(""); setSuccess(""); try { await task(); } catch (err: unknown) { setError(messageOf(err)); } finally { setBusy(false); } };
  const saveProfile = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); void action(async () => { await api("/account", { method: "PATCH", body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }) }); await refresh(); setSuccess("Tu perfil se guardó correctamente."); }); };
  const saveAddress = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void action(async () => { const saved = await api<Address>("/addresses", { method: "POST", body: JSON.stringify(address) }); setAddresses((current) => [...current, saved]); setAddress(emptyAddress); setSuccess("Dirección guardada."); }); };
  if (!user) return <main className="page-shell operations-shell"><AuthPanel /></main>;
  return <main className="page-shell operations-shell"><header className="operations-header operations-row wrap"><div><p className="eyebrow">MI ESPACIO</p><h1 className="page-title">Hola, {user.name.split(" ")[0]}.</h1><p className="muted">Tus favoritos, tus pedidos y un estilo muy tuyo.</p></div><button className="operations-link" disabled={busy} onClick={() => void action(async () => { await api("/auth/logout", { method: "POST", body: "{}" }); await refresh(); })}><LogOut size={14} style={{ display: "inline", marginRight: 8 }} />Cerrar sesión</button></header><div className="operations-tabs" role="tablist" aria-label="Mi cuenta">{[{ id: "pedidos", label: "Mis pedidos", icon: Package }, { id: "perfil", label: "Mi perfil", icon: UserRound }, { id: "direcciones", label: "Mis direcciones", icon: MapPin }].map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}><Icon size={14} style={{ display: "inline", marginRight: 8 }} />{label}</button>)}</div>{error && <p className="operations-alert" role="alert">{error}</p>}{success && <p className="operations-success" role="status">{success}</p>}{loading ? <p className="muted" role="status">Cargando tu información…</p> : tab === "pedidos" ? <section className="operations-panel"><h2>Tu historia con nosotras</h2>{orders.length ? orders.map((order) => <article className="operations-order" key={order.id}><div className="operations-row wrap"><div><div className="operations-order-title"><Link href={`/cuenta/pedidos/${order.id}`}>Pedido {order.number}</Link><StatusBadge status={order.status} /></div><p className="muted">{date(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} piezas</p></div><strong>{money(order.total)}</strong></div><div className="operations-row"><StatusBadge status={order.paymentStatus} /><Link className="operations-link" href={`/cuenta/pedidos/${order.id}`}>Ver pedido <ArrowRight size={13} style={{ display: "inline" }} /></Link></div></article>) : <div className="empty-state"><Package size={36} /><h3>Tu primera historia está por comenzar.</h3><p className="muted">Aquí podrás consultar todos tus pedidos.</p><Link href="/catalogo" className="button">EXPLORAR LA COLECCIÓN</Link></div>}</section> : tab === "perfil" ? <section className="operations-panel" style={{ maxWidth: 760 }}><h2>Los detalles que importan</h2><form onSubmit={saveProfile}><div className="form-grid"><label className="field">Nombre completo<input name="name" defaultValue={user.name} autoComplete="name" required minLength={2} maxLength={100} /></label><label className="field">Teléfono<input name="phone" defaultValue={user.phone || ""} autoComplete="tel" maxLength={30} /></label><label className="field operations-wide">Correo electrónico<input value={user.email} disabled /></label></div><div className="operations-actions"><button className="button" disabled={busy}>{busy ? "GUARDANDO…" : "GUARDAR CAMBIOS"}<Check size={15} /></button></div></form>{user.role !== "CUSTOMER" && <div className="operations-actions"><Link href="/admin" className="operations-link">Ir a la administración de la tienda</Link></div>}</section> : <div className="operations-grid"><section className="operations-panel"><h2>Agregar una dirección</h2><form onSubmit={saveAddress}><AddressFields value={address} onChange={setAddress} /><div className="operations-actions"><button className="button" disabled={busy}>{busy ? "GUARDANDO…" : "GUARDAR DIRECCIÓN"}</button></div></form></section><section className="operations-panel"><h2>Tus direcciones</h2>{addresses.length ? addresses.map((entry) => <article className="operations-order" key={entry.id}><address className="operations-address"><strong>{entry.name}</strong><br />{entry.line1}<br />{entry.line2 && <>{entry.line2}<br /></>}{entry.city}, {entry.department}<br />{entry.phone}</address><button className="operations-link" disabled={busy} onClick={() => void action(async () => { await api(`/addresses/${entry.id}`, { method: "DELETE" }); setAddresses((current) => current.filter((item) => item.id !== entry.id)); })}>Eliminar dirección</button></article>) : <p className="muted">Todavía no has guardado una dirección.</p>}</section></div>}</main>;
}

export function OrderDetail({ id }: { id: string }) {
  const { settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => { let current = true; api<Order>(`/orders/${encodeURIComponent(id)}`).then((data) => { if (current) setOrder(data); }).catch((err: unknown) => { if (current) setError(messageOf(err)); }); return () => { current = false; }; }, [id]);
  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!file) return; setError(""); setBusy(true);
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "application/pdf"].includes(file.type)) { setError("Elige un archivo JPG, PNG o PDF de hasta 5 MB."); setBusy(false); return; }
    const body = new FormData(); body.append("file", file);
    try { setOrder(await api<Order>(`/orders/${id}/proof`, { method: "POST", body })); setSuccess("Recibimos tu comprobante. Nuestro equipo lo revisará antes de confirmar el pago."); setFile(null); } catch (err: unknown) { setError(messageOf(err)); } finally { setBusy(false); }
  };
  const stages = ["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];
  const payment = settings?.paymentMethods.find((method) => method.id === order?.paymentMethod);
  return <main className="page-shell operations-shell"><Link className="operations-link" href="/cuenta">← Mis pedidos</Link>{error && <p className="operations-alert" role="alert">{error}</p>}{!order ? <p className="muted" role="status">{error ? "No se pudo cargar este pedido. Inicia sesión con la cuenta que lo creó." : "Cargando tu pedido…"}</p> : <><header className="operations-header"><p className="eyebrow" style={{ marginTop: 28 }}>CADA DETALLE, CONTIGO</p><h1 className="page-title">Pedido {order.number}</h1><p className="muted">Creado el {date(order.createdAt)}</p><StatusBadge status={order.status} /></header>{success && <p className="operations-success" role="status">{success}</p>}<div className="operations-grid"><div className="operations-stack"><section className="operations-panel"><h2>El camino de tu pedido</h2>{order.status !== "CANCELLED" && <ol className="operations-timeline">{stages.map((stage, index) => <li key={stage} data-complete={index <= stages.indexOf(order.status)}>{statusLabels[stage]}</li>)}</ol>}{order.shipment && <div className="operations-notice"><strong>{order.shipment.carrier}</strong>{order.shipment.trackingNumber && <p>Guía: {order.shipment.trackingNumber}</p>}{order.shipment.trackingUrl && /^https:\/\//.test(order.shipment.trackingUrl) && <a className="operations-link" href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer">Consultar envío ↗</a>}</div>}{order.events.map((event) => <div className="operations-order" key={event.id}><p>{event.message}</p><small className="muted">{date(event.createdAt)}</small></div>)}</section><section className="operations-panel"><h2>Tu pago</h2><StatusBadge status={order.paymentStatus} />{settings?.demoMode && <p className="operations-notice">Modo demostración. No realices una transferencia real.</p>}{order.status !== "CANCELLED" && ["PENDING", "REJECTED"].includes(order.paymentStatus) && <>{payment && <div className="operations-notice"><strong>{payment.name} · {money(order.total)}</strong>{payment.number && <p>Número: <strong>{payment.number}</strong><br />Titular: {payment.holder}</p>}<p>{payment.instructions || "Consulta con la tienda las instrucciones de pago."}</p><p>Incluye la referencia {order.number} en tu transferencia.</p>{settings?.contactPhone && <p style={{ marginTop: 10 }}>¿Deseas enviar tu soporte por chat? <a className="operations-link" href={`https://wa.me/57${settings.contactPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola LUXE WOMAN, adjunto comprobante de pago de mi pedido #${order.number} por valor de ${money(order.total)}.`)}`} target="_blank" rel="noopener noreferrer">Enviar a WhatsApp ↗</a></p>}</div>}<form onSubmit={upload}><div className="operations-upload"><Upload size={24} /><label className="field">Sube tu comprobante<input name="proof" type="file" accept="image/jpeg,image/png,application/pdf" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><p className="muted" style={{ fontSize: 11 }}>JPG, PNG o PDF · Máximo 5 MB</p></div><div className="operations-actions"><button className="button" disabled={busy || !file}>{busy ? "ENVIANDO…" : "ENVIAR COMPROBANTE"}</button></div></form></>}{order.proofs.map((proof) => <div key={proof.id} className="operations-order"><div className="operations-row wrap"><a className="operations-link" href={`/api/v1/proofs/${proof.id}/file`} target="_blank" rel="noopener noreferrer">{proof.originalName}</a><StatusBadge status={proof.status} /></div>{proof.note && <p>{proof.note}</p>}</div>)}</section></div><aside className="operations-stack"><section className="operations-panel"><h2>Tus piezas</h2>{order.items.map((item) => <div className="operations-item" key={item.id}>{item.image && <Image src={item.image} alt={item.productName} width={64} height={76} style={{ objectFit: "cover", borderRadius: 4 }} />}<div><strong>{item.productName}</strong><p className="muted">{item.color} · {item.size} · Cant. {item.quantity}</p><p>{money(item.unitPrice * item.quantity)}</p></div></div>)}<div className="operations-summary-line"><span>Subtotal</span><span>{money(order.subtotal)}</span></div><div className="operations-summary-line"><span>Envío</span><span>{order.shipping ? money(order.shipping) : "Sin costo"}</span></div><div className="operations-summary-line operations-summary-total"><strong>Total</strong><strong>{money(order.total)}</strong></div></section><section className="operations-panel"><h2>Destino de tu pedido</h2><address className="operations-address">{order.address.name}<br />{order.address.line1}<br />{order.address.line2 && <>{order.address.line2}<br /></>}{order.address.city}, {order.address.department}<br />{order.address.phone}</address></section></aside></div></>}</main>;
}
