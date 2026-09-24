"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Boxes, Check, ClipboardList, Download, LayoutDashboard, Plus, RefreshCw, Settings, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Category, Order, Product, ShopSettings, User } from "@/lib/types";
import { useStore } from "@/components/store";
import { AuthPanel, date, messageOf, money, StatusBadge } from "./account";
import "./operations.css";

type Metrics = { revenue: number; orders: number; customers: number; products: number; pendingPayments: number; lowStock: number; recentOrders: Order[]; salesByMonth: { month: string; total: number }[] };
type Customer = User & { _count: { orders: number }; createdAt: string };
type AuditEntry = { id: string; actorId: string | null; action: string; entityId: string | null; metadata: unknown; createdAt: string };

function useRemote<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await api<T>(path);
        if (active) {
          setData(result);
          setError("");
        }
      } catch (err: unknown) {
        if (active) setError(messageOf(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [path, version]);
  return {
    data,
    error,
    loading,
    reload: () => {
      setLoading(true);
      setVersion((value) => value + 1);
    },
    setData
  };
}

function RemoteState({ error, loading, retry }: { error: string; loading: boolean; retry: () => void }) { return error ? <div className="operations-alert" role="alert">{error}<div><button className="operations-link" onClick={retry}>Intentar de nuevo</button></div></div> : loading ? <p className="muted" role="status">Cargando información…</p> : null; }

function RecentOrders({ orders, select }: { orders: Order[]; select: (order: Order) => void }) {
  return orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Pedido</th><th>Fecha</th><th>Pago</th><th>Estado</th><th>Total</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.number}</strong><br /><span className="muted">{order.address.name}</span></td><td>{date(order.createdAt)}</td><td><StatusBadge status={order.paymentStatus} /></td><td><StatusBadge status={order.status} /></td><td>{money(order.total)}</td><td><button className="operations-link" onClick={() => select(order)}>Ver <ArrowRight size={12} style={{ display: "inline" }} /></button></td></tr>)}</tbody></table></div> : <p className="muted">Aún no hay pedidos para mostrar.</p>;
}

function Dashboard({ select, reports = false }: { select: (order: Order) => void; reports?: boolean }) {
  const { data, error, loading, reload } = useRemote<Metrics>("/admin/metrics");
  const download = () => { if (!data) return; const csv = "Mes,Ventas aprobadas COP\r\n" + data.salesByMonth.map((entry) => `${entry.month},${entry.total}`).join("\r\n"); const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ventas-luxe.csv"; anchor.click(); URL.revokeObjectURL(url); };
  return <><RemoteState error={error} loading={loading} retry={reload} />{data && <><div className="admin-metrics">{[{ label: "VENTAS APROBADAS", value: money(data.revenue) }, { label: "PEDIDOS", value: data.orders }, { label: "CLIENTES", value: data.customers }, { label: "PRODUCTOS", value: data.products }, { label: "PAGOS POR REVISAR", value: data.pendingPayments }, { label: "VARIANTES CON STOCK BAJO", value: data.lowStock }].map((metric) => <div className="admin-metric" key={metric.label}><p>{metric.label}</p><strong>{metric.value}</strong></div>)}</div><section className="operations-panel"><div className="admin-toolbar"><h2>{reports ? "Ventas por mes" : "Los últimos pedidos"}</h2><button className="operations-link" onClick={reports ? download : reload}>{reports ? <><Download size={14} style={{ display: "inline", marginRight: 6 }} />Exportar CSV</> : <><RefreshCw size={14} style={{ display: "inline", marginRight: 6 }} />Actualizar</>}</button></div>{reports ? <><p className="muted" style={{ fontSize: 12 }}>Ingresos de pedidos con pago aprobado. Valores en pesos colombianos.</p><table className="admin-table"><thead><tr><th>Mes</th><th>Ventas</th></tr></thead><tbody>{data.salesByMonth.map((entry) => <tr key={entry.month}><td>{entry.month}</td><td>{money(entry.total)}</td></tr>)}</tbody></table>{!data.salesByMonth.length && <p className="muted">Los reportes aparecerán cuando se registren pagos aprobados.</p>}</> : <RecentOrders orders={data.recentOrders} select={select} />}</section></>}</>;
}

type VariantDraft = { id?: string; sku: string; size: string; color: string; colorHex: string; stock: number };
type ProductDraft = { name: string; slug: string; description: string; details: string; materials: string; care: string; categoryId: string; price: number; compareAtPrice: number | null; active: boolean; featured: boolean; isNew: boolean; images: string; variants: VariantDraft[] };
const blankVariant = (): VariantDraft => ({ sku: "", size: "Única", color: "Natural", colorHex: "#d9bfaa", stock: 0 });
const draftOf = (product?: Product): ProductDraft => product ? { name: product.name, slug: product.slug, description: product.description, details: product.details, materials: product.materials, care: product.care, categoryId: product.categoryId, price: product.price, compareAtPrice: product.compareAtPrice, active: product.active, featured: product.featured, isNew: product.isNew, images: product.images.map((image) => image.url).join("\n"), variants: product.variants.map((variant) => ({ ...variant })) } : { name: "", slug: "", description: "", details: "", materials: "", care: "", categoryId: "", price: 0, compareAtPrice: null, active: true, featured: false, isNew: true, images: "", variants: [blankVariant()] };

function ProductEditor({ product, close, saved }: { product?: Product; close: () => void; saved: () => void }) {
  const [draft, setDraft] = useState<ProductDraft>(() => draftOf(product));
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { api<Category[]>("/categories").then(setCategories).catch((error: unknown) => setError(messageOf(error))); }, []);
  const update = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const variantUpdate = (index: number, key: keyof VariantDraft, value: string | number) => setDraft((current) => ({ ...current, variants: current.variants.map((variant, currentIndex) => currentIndex === index ? { ...variant, [key]: value } : variant) }));
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const form = new FormData();
        form.append("file", files[i]);
        const res = await api<{ url: string }>("/admin/upload", { method: "POST", body: form });
        setDraft((current) => ({
          ...current,
          images: current.images ? `${current.images.trim()}\n${res.url}` : res.url
        }));
      }
    } catch (err: unknown) {
      setError(messageOf(err));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try { const { images, variants, ...fields } = draft; await api(`/admin/products${product ? `/${product.id}` : ""}`, { method: product ? "PATCH" : "POST", body: JSON.stringify({ ...fields, images: images.split("\n").map((url) => url.trim()).filter(Boolean).map((url) => ({ url, alt: draft.name })), variants: variants.map((variant) => ({ sku: variant.sku, size: variant.size, color: variant.color, colorHex: variant.colorHex, stock: variant.stock })) }) }); saved(); } catch (err: unknown) { setError(messageOf(err)); } finally { setBusy(false); }
  };
  return <section className="operations-panel"><div className="admin-toolbar"><h2>{product ? "Editar producto" : "Una nueva pieza"}</h2><button className="operations-link" onClick={close}>Volver al catálogo</button></div>{error && <p className="operations-alert" role="alert">{error}</p>}<form onSubmit={submit}><div className="form-grid"><label className="field">Nombre<input value={draft.name} required maxLength={180} onChange={(event) => update("name", event.target.value)} /></label><label className="field">URL del producto<input value={draft.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Letras minúsculas, números y guiones" placeholder="vestido-aura" onChange={(event) => update("slug", event.target.value)} /></label><label className="field">Categoría<select value={draft.categoryId} required onChange={(event) => update("categoryId", event.target.value)}><option value="">Selecciona una categoría</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label className="field">Precio (COP)<input type="number" value={draft.price} required min={1} step={1} onChange={(event) => update("price", Number(event.target.value))} /></label><label className="field">Precio anterior (opcional)<input type="number" value={draft.compareAtPrice ?? ""} min={draft.price} step={1} onChange={(event) => update("compareAtPrice", event.target.value === "" ? null : Number(event.target.value))} /></label><label className="field operations-wide">Descripción<textarea value={draft.description} required onChange={(event) => update("description", event.target.value)} /></label>{(["details", "materials", "care"] as const).map((key) => <label className="field" key={key}>{key === "details" ? "Detalles" : key === "materials" ? "Materiales" : "Cuidados"}<textarea value={draft[key]} onChange={(event) => update(key, event.target.value)} /></label>)}<div className="field operations-wide"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span>Imágenes · Una URL por línea</span><label className="operations-link" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={13} /> {uploading ? "Subiendo…" : "Subir foto desde este dispositivo"}<input type="file" accept="image/*" multiple disabled={uploading} style={{ display: "none" }} onChange={handleFileUpload} /></label></div><textarea value={draft.images} required placeholder="/images/producto.jpg o https://…" onChange={(event) => update("images", event.target.value)} /><p className="muted" style={{ fontSize: 11, marginTop: 4 }}>Sube fotos directamente o pega enlaces HTTPS (Cloudinary, Supabase o URLs directas).</p></div></div><div className="operations-actions">{([{ key: "active", label: "Visible en tienda" }, { key: "featured", label: "Destacado" }, { key: "isNew", label: "Nueva colección" }] as const).map(({ key, label }) => <label className="operations-check" key={key}><input type="checkbox" checked={draft[key]} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div><h3 style={{ marginTop: 32 }}>Variantes e inventario</h3><p className="muted" style={{ fontSize: 12 }}>Cada combinación tiene un SKU único. Para retirar una variante existente, deja su stock en cero.</p>{draft.variants.map((variant, index) => <div className="admin-variant" key={variant.id || index}><label className="field">SKU<input value={variant.sku} readOnly={Boolean(variant.id)} required onChange={(event) => variantUpdate(index, "sku", event.target.value)} /></label><label className="field">Talla<input value={variant.size} required onChange={(event) => variantUpdate(index, "size", event.target.value)} /></label><label className="field">Color<input value={variant.color} required onChange={(event) => variantUpdate(index, "color", event.target.value)} /></label><label className="field">Stock<input type="number" min={0} step={1} required value={variant.stock} onChange={(event) => variantUpdate(index, "stock", Number(event.target.value))} /></label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="color" aria-label={`Color visual de variante ${index + 1}`} value={variant.colorHex} style={{ width: 35, padding: 3 }} onChange={(event) => variantUpdate(index, "colorHex", event.target.value)} />{!variant.id && draft.variants.length > 1 && <button className="operations-link" type="button" aria-label={`Eliminar variante ${index + 1}`} onClick={() => update("variants", draft.variants.filter((_, currentIndex) => currentIndex !== index))}><X size={16} /></button>}</div></div>)}<button className="operations-link" type="button" onClick={() => update("variants", [...draft.variants, blankVariant()])}><Plus size={14} style={{ display: "inline" }} /> Agregar variante</button><div className="operations-actions"><button className="button" disabled={busy}>{busy ? "GUARDANDO…" : "GUARDAR PRODUCTO"}<Check size={15} /></button><button className="button button-secondary" type="button" onClick={close}>CANCELAR</button></div></form></section>;
}


function ProductsAdmin() {
  const { data, error, loading, reload } = useRemote<{ items: Product[]; total: number }>("/admin/products");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  const archive = async (product: Product) => { if (!window.confirm(`¿Archivar “${product.name}”? Dejará de estar visible en la tienda.`)) return; setBusy(product.id); setActionError(""); try { await api(`/admin/products/${product.id}`, { method: "DELETE" }); reload(); } catch (err: unknown) { setActionError(messageOf(err)); } finally { setBusy(""); } };
  if (editing) return <ProductEditor product={editing === "new" ? undefined : editing} close={() => setEditing(null)} saved={() => { setEditing(null); reload(); }} />;
  return <section className="operations-panel"><div className="admin-toolbar"><h2>Catálogo e inventario</h2><button className="button" onClick={() => setEditing("new")}><Plus size={15} /> NUEVO PRODUCTO</button></div><label className="field" style={{ maxWidth: 340, marginBottom: 20 }}>Buscar por nombre o SKU<input placeholder="Encuentra una pieza…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><RemoteState error={error} loading={loading} retry={reload} />{actionError && <p className="operations-alert" role="alert">{actionError}</p>}{data && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Visible</th><th>Acciones</th></tr></thead><tbody>{data.items.filter((product) => `${product.name} ${product.variants.map((variant) => variant.sku).join(" ")}`.toLowerCase().includes(search.toLowerCase())).map((product) => <tr key={product.id}><td><div className="admin-product-name">{product.images[0] && <Image src={product.images[0].url} alt={product.name} width={40} height={48} style={{ objectFit: "cover", borderRadius: 4 }} />}<div><strong>{product.name}</strong><br /><span className="muted">{product.category.name} · {product.variants.length} variantes</span></div></div></td><td>{money(product.price)}</td><td>{product.variants.reduce((sum, variant) => sum + variant.stock, 0)}</td><td>{product.active ? "Sí" : "Archivado"}</td><td><div style={{ display: "flex", gap: 16 }}><button className="operations-link" onClick={() => setEditing(product)}>Editar</button>{product.active && <button className="operations-link" disabled={busy === product.id} aria-label={`Archivar ${product.name}`} onClick={() => void archive(product)}><Trash2 size={14} /></button>}</div></td></tr>)}</tbody></table>{!data.items.length && <p className="muted">Agrega tu primer producto para comenzar.</p>}</div>}</section>;
}

const nextStates: Record<Order["status"], Order["status"][]> = { PENDING_PAYMENT: ["CANCELLED"], CONFIRMED: ["PREPARING", "CANCELLED"], PREPARING: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [] };
const orderLabels: Record<Order["status"], string> = { PENDING_PAYMENT: "Pendiente de pago", CONFIRMED: "Pago confirmado", PREPARING: "En preparación", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };

function OrderEditor({ initial, close, isAdmin }: { initial: Order; close: () => void; isAdmin: boolean }) {
  const [order, setOrder] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Order["status"]>(initial.status);
  const [carrier, setCarrier] = useState(initial.shipment?.carrier || "Coordinadora");
  const [trackingNumber, setTrackingNumber] = useState(initial.shipment?.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(initial.shipment?.trackingUrl || "");
  const action = async (path: string, method: string, body: object) => { setBusy(true); setError(""); setSuccess(""); try { const updated = await api<Order>(path, { method, body: JSON.stringify(body) }); setOrder(updated); setStatus(updated.status); setNote(""); setSuccess("El pedido se actualizó correctamente."); } catch (error) { setError(messageOf(error)); } finally { setBusy(false); } };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void action(`/admin/orders/${order.id}`, "PATCH", { status, note, ...(status === "SHIPPED" || order.shipment ? { carrier, trackingNumber, trackingUrl } : {}) }); };
  return <div className="operations-stack"><section className="operations-panel"><div className="admin-toolbar"><div><button className="operations-link" onClick={close}><ArrowLeft size={13} style={{ display: "inline" }} /> Pedidos</button><h2 style={{ marginTop: 16 }}>{order.number}</h2></div><div><StatusBadge status={order.status} /> <StatusBadge status={order.paymentStatus} /></div></div><p className="muted">{order.address.name} · {date(order.createdAt)} · {money(order.total)}</p>{error && <p className="operations-alert" role="alert">{error}</p>}{success && <p className="operations-success" role="status">{success}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Pieza</th><th>Variante</th><th>Cantidad</th><th>Precio</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.color} · {item.size}</td><td>{item.quantity}</td><td>{money(item.unitPrice * item.quantity)}</td></tr>)}</tbody></table></div><p className="muted" style={{ fontSize: 12 }}>Envío: {money(order.shipping)} · Total: <strong>{money(order.total)}</strong></p><address className="operations-address">{order.address.name}<br />{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />{order.address.city}, {order.address.department}<br />{order.address.phone}</address></section><section className="operations-panel"><h2>Comprobantes de pago · {order.paymentMethod}</h2>{order.proofs.length ? order.proofs.map((proof) => <div className="operations-order" key={proof.id}><div className="operations-row wrap"><a className="operations-link" href={`/api/v1/proofs/${proof.id}/file`} target="_blank" rel="noopener noreferrer">Abrir {proof.originalName} ↗</a><StatusBadge status={proof.status} /></div><p className="muted">{date(proof.createdAt)}</p>{proof.note && <p>{proof.note}</p>}</div>) : <p className="muted">La clienta aún no ha enviado un comprobante.</p>}{isAdmin && order.paymentStatus === "UNDER_REVIEW" && <><label className="field" style={{ marginTop: 20 }}>Observación de revisión<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Obligatoria si rechazas el comprobante" /></label><div className="operations-actions"><button className="button" disabled={busy} onClick={() => void action(`/admin/orders/${order.id}/payment`, "POST", { decision: "APPROVED", note })}>APROBAR PAGO</button><button className="button button-secondary" disabled={busy || !note.trim()} onClick={() => void action(`/admin/orders/${order.id}/payment`, "POST", { decision: "REJECTED", note })}>RECHAZAR COMPROBANTE</button></div></>}</section><section className="operations-panel"><h2>Preparación y entrega</h2><form onSubmit={submit}><div className="form-grid"><label className="field">Estado del pedido<select value={status} onChange={(event) => setStatus(event.target.value as Order["status"])}><option value={order.status}>{orderLabels[order.status]}</option>{nextStates[order.status].map((next) => <option value={next} key={next}>{orderLabels[next]}</option>)}</select></label><label className="field">Transportadora<select value={carrier} onChange={(event) => setCarrier(event.target.value)}><option>Coordinadora</option><option>Interrapidísimo</option><option>Entrega propia</option></select></label><label className="field">Número de guía<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} required={status === "SHIPPED" && carrier !== "Entrega propia"} /></label><label className="field">Enlace de seguimiento (opcional)<input value={trackingUrl} type="url" pattern="https://.*" title="Usa un enlace seguro que comience por https://" onChange={(event) => setTrackingUrl(event.target.value)} /></label><label className="field operations-wide">Nota para la clienta<textarea value={note} required={status === "CANCELLED"} onChange={(event) => setNote(event.target.value)} /></label></div><div className="operations-actions"><button className="button" disabled={busy || ["CANCELLED", "DELIVERED"].includes(order.status)}>{busy ? "GUARDANDO…" : "ACTUALIZAR PEDIDO"}</button></div></form></section><section className="operations-panel"><h2>Historial</h2>{order.events.map((event) => <div className="operations-order" key={event.id}><p>{event.message}</p><small className="muted">{date(event.createdAt)}</small></div>)}</section></div>;
}

function OrdersAdmin({ select }: { select: (order: Order) => void }) {
  const { data, error, loading, reload } = useRemote<Order[]>("/admin/orders");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  return <section className="operations-panel"><div className="admin-toolbar"><h2>Pedidos</h2><button className="operations-link" onClick={reload}>Actualizar</button></div><div className="form-grid" style={{ marginBottom: 24 }}><label className="field">Buscar pedido o clienta<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Número de pedido o nombre" /></label><label className="field">Estado<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Todos los pedidos</option><option value="UNDER_REVIEW">Pagos por revisar</option>{Object.entries(orderLabels).map(([status, label]) => <option value={status} key={status}>{label}</option>)}</select></label></div><RemoteState error={error} loading={loading} retry={reload} />{data && <RecentOrders orders={data.filter((order) => (filter === "ALL" || order.status === filter || order.paymentStatus === filter) && `${order.number} ${order.address.name}`.toLowerCase().includes(search.toLowerCase()))} select={select} />}</section>;
}

function CustomerRow({ customer, updated }: { customer: Customer; updated: () => void }) {
  const [role, setRole] = useState(customer.role);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); setError(""); try { await api(`/admin/customers/${customer.id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }); updated(); } catch (error) { setError(messageOf(error)); } finally { setBusy(false); } };
  return <tr><td><strong>{customer.name}</strong><br /><span className="muted">{customer.email}</span>{error && <p className="operations-alert" role="alert">{error}</p>}</td><td>{customer._count.orders}</td><td>{date(customer.createdAt)}</td><td><select value={role} aria-label={`Rol de ${customer.name}`} onChange={(event) => setRole(event.target.value as User["role"])}><option value="CUSTOMER">Clienta</option><option value="EMPLOYEE">Equipo</option><option value="ADMIN">Administración</option></select></td><td><button className="operations-link" disabled={busy || role === customer.role} onClick={() => void save()}>Guardar</button></td></tr>;
}

function CustomersAdmin() {
  const { data, error, loading, reload } = useRemote<Customer[]>("/admin/customers");
  const [search, setSearch] = useState("");
  return <section className="operations-panel"><h2>Clientas y permisos</h2><p className="muted" style={{ fontSize: 12 }}>El equipo gestiona catálogo y logística. Administración también gestiona pagos, roles y configuración.</p><label className="field" style={{ maxWidth: 340, margin: "20px 0" }}>Buscar por nombre o correo<input value={search} onChange={(event) => setSearch(event.target.value)} /></label><RemoteState error={error} loading={loading} retry={reload} />{data && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Clienta</th><th>Pedidos</th><th>Registro</th><th>Rol</th><th>Acción</th></tr></thead><tbody>{data.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(search.toLowerCase())).map((customer) => <CustomerRow key={customer.id} customer={customer} updated={reload} />)}</tbody></table></div>}</section>;
}

function SettingsEditor({ initial }: { initial: ShopSettings }) {
  const { refresh } = useStore();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const updatePayment = (index: number, key: "enabled" | "number" | "holder" | "instructions", value: string | boolean) => setDraft((current) => ({ ...current, paymentMethods: current.paymentMethods.map((payment, currentIndex) => index === currentIndex ? { ...payment, [key]: value } : payment) }));
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setBusy(true); setError(""); setSuccess(""); try { setDraft(await api<ShopSettings>("/admin/settings", { method: "PATCH", body: JSON.stringify(draft) })); await refresh(); setSuccess("La configuración se guardó correctamente."); } catch (error) { setError(messageOf(error)); } finally { setBusy(false); } };
  return <form onSubmit={submit} className="operations-stack">{error && <p className="operations-alert" role="alert">{error}</p>}{success && <p className="operations-success" role="status">{success}</p>}<section className="operations-panel"><h2>La identidad de tu boutique</h2><div className="form-grid"><label className="field">Nombre de la marca<input required value={draft.brandName} onChange={(event) => setDraft({ ...draft, brandName: event.target.value })} /></label><label className="field">Correo de atención<input type="email" required value={draft.contactEmail} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} /></label><label className="field">Teléfono / WhatsApp de atención<input value={draft.contactPhone || ""} placeholder="3001234567" onChange={(event) => setDraft({ ...draft, contactPhone: event.target.value })} /></label><label className="field">Tarifa de envío (COP)<input type="number" min={0} step={1} required value={draft.shippingFee} onChange={(event) => setDraft({ ...draft, shippingFee: Number(event.target.value) })} /></label><label className="field">Envío gratis desde (COP)<input type="number" min={0} step={1} required value={draft.freeShippingThreshold} onChange={(event) => setDraft({ ...draft, freeShippingThreshold: Number(event.target.value) })} /></label></div></section><section className="operations-panel"><h2>Pagos manuales</h2><label className="operations-check"><input type="checkbox" checked={draft.demoMode} onChange={(event) => setDraft({ ...draft, demoMode: event.target.checked })} />Modo demostración</label><p className="muted" style={{ fontSize: 12 }}>Al desactivarlo, los métodos habilitados deben tener un número y titular válidos. Verifica tus datos antes de recibir pagos reales.</p>{draft.paymentMethods.map((method, index) => <div className="operations-order" key={method.id}><div className="operations-row" style={{ marginBottom: 20 }}><h3>{method.name}</h3><label className="operations-check"><input type="checkbox" checked={method.enabled} onChange={(event) => updatePayment(index, "enabled", event.target.checked)} />Habilitado</label></div><div className="form-grid"><label className="field">Número de cuenta<input value={method.number} required={!draft.demoMode && method.enabled} onChange={(event) => updatePayment(index, "number", event.target.value)} /></label><label className="field">Titular<input value={method.holder} required={!draft.demoMode && method.enabled} onChange={(event) => updatePayment(index, "holder", event.target.value)} /></label><label className="field operations-wide">Instrucciones visibles al comprar<textarea value={method.instructions} onChange={(event) => updatePayment(index, "instructions", event.target.value)} /></label></div></div>)}</section><section className="operations-panel"><h2>Acceso con Google</h2><p className="muted">{draft.googleEnabled ? "La integración está habilitada en el servidor." : "La integración estará disponible al configurar las credenciales de Google en el servidor."}</p></section><div className="operations-actions"><button className="button" disabled={busy}>{busy ? "GUARDANDO…" : "GUARDAR CONFIGURACIÓN"}</button></div></form>;
}

function SettingsAdmin() { const { data, error, loading, reload } = useRemote<ShopSettings>("/admin/settings"); return <><RemoteState error={error} loading={loading} retry={reload} />{data && <SettingsEditor initial={data} />}</>; }
function AuditAdmin() { const { data, error, loading, reload } = useRemote<AuditEntry[]>("/admin/audit"); return <section className="operations-panel"><h2>Registro de actividad</h2><p className="muted" style={{ fontSize: 12 }}>Últimas 100 operaciones. Las acciones críticas quedan registradas por el servidor.</p><RemoteState error={error} loading={loading} retry={reload} />{data && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Fecha</th><th>Acción</th><th>Actor</th><th>Registro</th></tr></thead><tbody>{data.map((entry) => <tr key={entry.id}><td>{date(entry.createdAt)}</td><td>{entry.action}</td><td>{entry.actorId || "Sistema"}</td><td>{entry.entityId || "—"}<details><summary>Detalles</summary><pre style={{ whiteSpace: "pre-wrap", maxWidth: 360 }}>{JSON.stringify(entry.metadata, null, 2)}</pre></details></td></tr>)}</tbody></table></div>}</section>; }

export function Admin() {
  const router = useRouter();
  const { user, loading, refresh } = useStore();
  const isAdmin = user?.role === "ADMIN";
  const [tab, setTab] = useState(() => (user?.role === "EMPLOYEE" ? "productos" : "inicio"));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  if (loading) return <main className="page-shell operations-shell"><p role="status">Verificando tu acceso…</p></main>;
  if (!user) return <main className="page-shell operations-shell"><header className="operations-header"><p className="eyebrow">LA BOUTIQUE, ENTRE BAMBALINAS</p><h1 className="page-title">Acceso al equipo.</h1></header><AuthPanel /></main>;
  if (user.role === "CUSTOMER") return <main className="page-shell operations-shell"><section className="operations-panel"><ShieldCheck size={30} /><h1 className="page-title">Acceso reservado al equipo.</h1><p className="muted">Tu cuenta no tiene permisos para administrar esta tienda.</p><Link href="/cuenta" className="button">VOLVER A MI CUENTA</Link></section></main>;
  const navigation = [{ id: "inicio", label: "Vista general", icon: LayoutDashboard, admin: true }, { id: "productos", label: "Productos", icon: Boxes, admin: false }, { id: "pedidos", label: "Pedidos", icon: ClipboardList, admin: false }, { id: "clientes", label: "Clientas y roles", icon: Users, admin: true }, { id: "reportes", label: "Reportes", icon: BarChart3, admin: true }, { id: "configuracion", label: "Configuración", icon: Settings, admin: true }, { id: "auditoria", label: "Actividad", icon: ShieldCheck, admin: true }].filter((entry) => !entry.admin || isAdmin);
  const selectOrder = (order: Order) => { setSelectedOrder(order); setTab("pedidos"); };
  return <main className="page-shell operations-shell"><header className="operations-header operations-row wrap"><div><p className="eyebrow">ESTUDIO DE LA BOUTIQUE</p><h1 className="page-title">Cada detalle cuenta.</h1><p className="muted">Bienvenida, {user.name}. Este es el pulso de tu tienda.</p></div><div style={{ display: "flex", gap: 20, alignItems: "center" }}><Link className="operations-link" href="/">Ver la tienda ↗</Link><button className="operations-link" onClick={async () => { await api("/auth/logout", { method: "POST", body: "{}" }); await refresh(); router.push("/"); }}>Cerrar sesión</button></div></header><div className="admin-layout"><nav className="admin-navigation" aria-label="Administración">{navigation.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => { setTab(id); setSelectedOrder(null); }}><Icon size={17} />{label}</button>)}</nav><div>{selectedOrder ? <OrderEditor key={selectedOrder.id} initial={selectedOrder} close={() => setSelectedOrder(null)} isAdmin={isAdmin} /> : tab === "productos" ? <ProductsAdmin /> : tab === "pedidos" ? <OrdersAdmin select={selectOrder} /> : tab === "clientes" && isAdmin ? <CustomersAdmin /> : tab === "configuracion" && isAdmin ? <SettingsAdmin /> : tab === "auditoria" && isAdmin ? <AuditAdmin /> : isAdmin ? <Dashboard select={selectOrder} reports={tab === "reportes"} /> : <ProductsAdmin />}</div></div></main>;
}
