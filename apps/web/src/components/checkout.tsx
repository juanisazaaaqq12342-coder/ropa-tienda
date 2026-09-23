"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, ShoppingBag, Truck } from "lucide-react";
import { api } from "@/lib/api";
import type { Address, Order } from "@/lib/types";
import { useStore } from "@/components/store";
import { AddressFields, AuthPanel, emptyAddress, messageOf, money } from "./account";
import "./operations.css";

export function Checkout() {
  const { user, cart, settings, refresh } = useStore();
  const router = useRouter();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const firstEnabledMethod = settings?.paymentMethods.find((entry) => entry.enabled)?.id;
  const [selectedMethod, setSelectedMethod] = useState<"NEQUI" | "DAVIPLATA" | null>(null);
  const paymentMethod = selectedMethod || firstEnabledMethod || "NEQUI";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const key = useRef("");
  const submitting = useRef(false);

  useEffect(() => { key.current = crypto.randomUUID(); }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      try {
        const data = await api<Address[]>("/addresses");
        if (active) {
          setAddresses(data);
          setAddress((current) => ({
            ...current,
            name: current.name || user.name,
            phone: current.phone || user.phone || ""
          }));
        }
      } catch (err: unknown) {
        if (active) setError(messageOf(err));
      }
    })();
    return () => { active = false; };
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return; submitting.current = true; setBusy(true); setError("");
    try {
      const order = await api<Order>("/checkout", { method: "POST", body: JSON.stringify({ address, paymentMethod, idempotencyKey: key.current }) });
      if (saveAddress) { try { await api("/addresses", { method: "POST", body: JSON.stringify(address) }); } catch { /* The order remains confirmed even when saving the optional address fails. */ } }
      await refresh(); router.push(`/cuenta/pedidos/${order.id}`);
    } catch (err: unknown) { setError(messageOf(err)); setBusy(false); submitting.current = false; }
  };

  if (!user) return <main className="page-shell operations-shell"><header className="operations-header"><p className="eyebrow">UN PASO MÁS CERCA</p><h1 className="page-title">Completa tu compra.</h1><p className="muted">Ingresa o crea una cuenta para guardar tu pedido y acompañar su entrega.</p></header><AuthPanel /></main>;
  if (!cart) return <main className="page-shell operations-shell"><p role="status">Preparando tu bolsa…</p></main>;
  if (!cart.items.length) return <main className="page-shell operations-shell"><div className="empty-state"><ShoppingBag size={36} /><h1 className="page-title">Tu bolsa está esperando.</h1><p className="muted">Elige las piezas que te acompañarán en tu próxima historia.</p><Link href="/catalogo" className="button">DESCUBRIR LA COLECCIÓN <ArrowRight size={15} /></Link></div></main>;

  const methods = settings?.paymentMethods.filter((method) => method.enabled) || [];

  return <main className="page-shell operations-shell"><header className="operations-header"><p className="eyebrow">HECHO PARA TI</p><h1 className="page-title">El último detalle.</h1><p className="muted">Completa tu dirección y elige cómo pagar. Tu pedido comienza aquí.</p></header>{error && <p className="operations-alert" role="alert">{error}</p>}{settings?.demoMode && <p className="operations-notice"><strong>Compra de demostración.</strong> Puedes probar el pedido y la carga de comprobantes. No transfieras dinero real.</p>}<form onSubmit={submit} className="operations-grid"><div className="operations-stack"><section className="operations-panel"><h2>01 · Tu dirección de entrega</h2>{addresses.length > 0 && <label className="field" style={{ marginBottom: 22 }}>Usar una dirección guardada<select defaultValue="" onChange={(event) => { const selected = addresses.find((entry) => entry.id === event.target.value); if (selected) { setAddress({ name: selected.name, phone: selected.phone, line1: selected.line1, line2: selected.line2, city: selected.city, department: selected.department, postalCode: selected.postalCode }); } }}><option value="">Nueva dirección</option>{addresses.map((entry) => <option key={entry.id} value={entry.id}>{entry.line1}, {entry.city}</option>)}</select></label>}<AddressFields value={address} onChange={setAddress} /><label className="operations-check" style={{ marginTop: 18 }}><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />Guardar esta dirección en mi cuenta</label></section><section className="operations-panel"><h2>02 · El viaje de tus piezas</h2><div className="operations-row"><div style={{ display: "flex", gap: 14, alignItems: "center" }}><Truck size={22} /><div><strong style={{ fontSize: 13 }}>Envío nacional</strong><p className="muted" style={{ fontSize: 12, margin: "6px 0 0" }}>La guía estará disponible en el detalle de tu pedido.</p></div></div><span style={{ fontSize: 13 }}>{cart.shipping ? money(cart.shipping) : "Sin costo"}</span></div></section><section className="operations-panel"><h2>03 · Tu método de pago</h2><p className="muted" style={{ fontSize: 13 }}>Después de crear tu pedido, verás los datos de transferencia y podrás cargar tu comprobante.</p>{methods.length ? methods.map((method) => <label className="operations-payment" key={method.id}><input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setSelectedMethod(method.id)} /><div><strong>{method.name}</strong><p className="muted">Transferencia y validación del comprobante</p>{method.instructions && <p>{method.instructions}</p>}</div></label>) : <p className="operations-alert">La tienda aún no tiene métodos de pago disponibles. Intenta de nuevo más tarde.</p>}</section></div><aside className="operations-panel operations-summary"><h2>Una selección muy tuya</h2>{cart.items.map((item) => <div className="operations-item" key={item.id}>{item.variant.product.images[0] && <Image src={item.variant.product.images[0].url} alt={item.variant.product.images[0].alt || item.variant.product.name} width={64} height={76} style={{ objectFit: "cover", borderRadius: 4 }} />}<div><strong>{item.variant.product.name}</strong><p className="muted">{item.variant.color} · {item.variant.size} · Cant. {item.quantity}</p><p>{money(item.lineTotal)}</p></div></div>)}<Link className="operations-link" href="/bolsa">Editar mi bolsa</Link><div className="operations-summary-line" style={{ marginTop: 22 }}><span>Subtotal</span><span>{money(cart.subtotal)}</span></div><div className="operations-summary-line"><span>Envío</span><span>{cart.shipping ? money(cart.shipping) : "Sin costo"}</span></div><div className="operations-summary-line operations-summary-total"><strong>Total</strong><strong>{money(cart.total)}</strong></div><p className="muted" style={{ fontSize: 11 }}>Valores en pesos colombianos (COP).</p><label className="operations-check" style={{ margin: "22px 0", alignItems: "start", lineHeight: 1.7 }}><input type="checkbox" required style={{ marginTop: 5 }} /><span>He leído y acepto los <Link className="operations-link" href="/legal/terminos">términos de compra</Link> y la <Link className="operations-link" href="/legal/privacidad">política de privacidad</Link>.</span></label><button className="button" style={{ width: "100%", justifyContent: "center" }} disabled={busy || !methods.length}>{busy ? "CREANDO TU PEDIDO…" : "CREAR MI PEDIDO"}<ArrowRight size={15} /></button><p className="muted" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 10, marginTop: 20 }}><LockKeyhole size={13} /> Compra segura · Revisión de pago manual</p></aside></form></main>;
}
