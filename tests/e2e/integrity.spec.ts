import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { Order, Product } from '../../apps/web/src/lib/types';
import { adminContext, apiPath, assertDemoMode, customerContext, testAddress, tinyPng } from './helpers';

test('servidor protege precios, idempotencia, propietarios, comprobantes y transiciones', async ({ playwright, request, baseURL }) => {
  await assertDemoMode(request);
  const admin = await adminContext(playwright, baseURL);
  const customer = await customerContext(playwright, baseURL);
  const stranger = await customerContext(playwright, baseURL);
  let order: Order | undefined;
  try {
    expect((await request.get(apiPath('/admin/metrics'))).status()).toBe(401);
    expect((await customer.get(apiPath('/admin/metrics'))).status()).toBe(403);
    const { items } = await (await request.get(apiPath('/products?limit=100'))).json() as { items: Product[] };
    const product = items.find(item => item.variants.some(variant => variant.stock > 2))!;
    expect(product).toBeTruthy();
    const variant = product.variants.find(item => item.stock > 2)!;
    const initialStock = variant.stock;
    expect((await customer.post(apiPath('/cart/items'), { data: { variantId: variant.id, quantity: 1, price: 1 } })).ok()).toBeTruthy();
    const key = randomUUID();
    const payload = { address: testAddress, paymentMethod: 'NEQUI', idempotencyKey: key, total: 1, subtotal: 1, paymentStatus: 'APPROVED' };
    const responses = await Promise.all([customer.post(apiPath('/checkout'), { data: payload }), customer.post(apiPath('/checkout'), { data: payload })]);
    expect(responses.every(response => response.ok())).toBeTruthy();
    const orders = await Promise.all(responses.map(response => response.json() as Promise<Order>));
    expect(orders[0].id).toBe(orders[1].id);
    order = orders[0];
    expect(order.subtotal).toBe(product.price);
    expect(order.total).toBe(order.subtotal + order.shipping);
    expect(order.paymentStatus).toBe('PENDING');
    const updated = await (await request.get(apiPath(`/products/${product.slug}`))).json() as Product;
    expect(updated.variants.find(item => item.id === variant.id)?.stock).toBe(initialStock - 1);
    expect((await stranger.get(apiPath(`/orders/${order.id}`))).status()).toBe(404);
    expect((await admin.patch(apiPath(`/admin/orders/${order.id}`), { data: { status: 'SHIPPED', carrier: 'Coordinadora' } })).status()).toBe(400);
    expect((await customer.post(apiPath(`/orders/${order.id}/proof`), { multipart: { file: { name: 'false.png', mimeType: 'image/png', buffer: Buffer.from('this is not an image') } } })).status()).toBe(400);
    const upload = await customer.post(apiPath(`/orders/${order.id}/proof`), { multipart: { file: { name: 'e2e.png', mimeType: 'image/png', buffer: tinyPng } } });
    expect(upload.ok()).toBeTruthy();
    const reviewed = await upload.json() as Order;
    expect(reviewed.paymentStatus).toBe('UNDER_REVIEW');
    const proofId = reviewed.proofs[0].id;
    expect((await stranger.get(apiPath(`/proofs/${proofId}/file`))).status()).toBe(403);
    expect((await request.get(apiPath(`/proofs/${proofId}/file`))).status()).toBe(401);
    expect((await customer.get(apiPath(`/proofs/${proofId}/file`))).ok()).toBeTruthy();
    expect((await customer.post(apiPath(`/admin/orders/${order.id}/payment`), { data: { decision: 'APPROVED' } })).status()).toBe(403);
    expect((await admin.post(apiPath(`/admin/orders/${order.id}/payment`), { data: { decision: 'REJECTED' } })).status()).toBe(400);
    const rejected = await admin.post(apiPath(`/admin/orders/${order.id}/payment`), { data: { decision: 'REJECTED', note: 'Prueba E2E: referencia no legible.' } });
    expect(rejected.ok()).toBeTruthy();
    expect((await rejected.json()).paymentStatus).toBe('REJECTED');
    for (let repetition = 0; repetition < 2; repetition++) {
      expect((await admin.patch(apiPath(`/admin/orders/${order.id}`), { data: { status: 'CANCELLED', note: 'Cierre de prueba automatizada.' } })).ok()).toBeTruthy();
    }
    const restored = await (await request.get(apiPath(`/products/${product.slug}`))).json() as Product;
    expect(restored.variants.find(item => item.id === variant.id)?.stock).toBe(initialStock);
    order = undefined;
  } finally {
    if (order) await admin.patch(apiPath(`/admin/orders/${order.id}`), { data: { status: 'CANCELLED', note: 'Limpieza de prueba automatizada.' } });
    await Promise.all([admin.dispose(), customer.dispose(), stranger.dispose()]);
  }
});

test('dos compras concurrentes no pueden vender la última unidad dos veces', async ({ playwright, request, baseURL }) => {
  await assertDemoMode(request);
  const admin = await adminContext(playwright, baseURL);
  const buyerA = await customerContext(playwright, baseURL);
  const buyerB = await customerContext(playwright, baseURL);
  let product: Product | undefined;
  let winner: Order | undefined;
  try {
    const categories = await (await request.get(apiPath('/categories'))).json() as { id: string }[];
    const identifier = randomUUID();
    const created = await admin.post(apiPath('/admin/products'), { data: {
      name: 'Producto E2E de concurrencia', slug: `e2e-concurrency-${identifier}`, description: 'Producto exclusivo de una prueba automatizada local.', categoryId: categories[0].id,
      price: 321000, images: [{ url: '/images/dress.jpg', alt: 'Prueba automatizada' }], variants: [{ sku: `E2E-${identifier}`, size: 'M', color: 'Marfil', colorHex: '#FBF8F5', stock: 1 }],
    } });
    expect(created.status()).toBe(201);
    product = await created.json() as Product;
    const variantId = product.variants[0].id;
    for (const buyer of [buyerA, buyerB]) expect((await buyer.post(apiPath('/cart/items'), { data: { variantId, quantity: 1 } })).ok()).toBeTruthy();
    const results = await Promise.all([buyerA, buyerB].map(buyer => buyer.post(apiPath('/checkout'), { data: { address: testAddress, paymentMethod: 'NEQUI', idempotencyKey: randomUUID() } })));
    expect(results.filter(response => response.ok())).toHaveLength(1);
    expect(results.filter(response => response.status() === 409)).toHaveLength(1);
    winner = await results.find(response => response.ok())!.json() as Order;
    const after = await (await request.get(apiPath(`/products/${product.slug}`))).json() as Product;
    expect(after.variants[0].stock).toBe(0);
    expect((await buyerA.post(apiPath('/cart/items'), { data: { variantId, quantity: 1 } })).status()).toBe(400);
  } finally {
    if (winner) await admin.patch(apiPath(`/admin/orders/${winner.id}`), { data: { status: 'CANCELLED', note: 'Limpieza de prueba de concurrencia.' } });
    if (product) await admin.delete(apiPath(`/admin/products/${product.id}`));
    await Promise.all([admin.dispose(), buyerA.dispose(), buyerB.dispose()]);
  }
});
