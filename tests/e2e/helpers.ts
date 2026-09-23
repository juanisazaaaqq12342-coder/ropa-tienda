import { expect, type APIRequestContext, type Playwright, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

export const apiPath = (route: string) => `/api/v1${route}`;
export const testAddress = {
  name: 'Compradora E2E', phone: '3000000000', line1: 'Calle de pruebas 12 # 34-56',
  city: 'Bogotá', department: 'Bogotá D.C.', postalCode: '110111',
};
export const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/b1kAAAAASUVORK5CYII=', 'base64');
export function newCustomer() {
  const suffix = randomUUID();
  return { name: 'Compradora E2E', email: `e2e-${suffix}@example.test`, password: `Prueba-${suffix}!` };
}
export async function assertDemoMode(request: APIRequestContext) {
  const response = await request.get(apiPath('/settings'));
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).demoMode, 'Las pruebas solo pueden modificar una tienda en modo demostración.').toBe(true);
}
export async function adminContext(playwright: Playwright, baseURL?: string) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Configura SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env para ejecutar E2E.');
  const context = await playwright.request.newContext({ baseURL });
  const response = await context.post(apiPath('/auth/login'), { data: { email, password } });
  expect(response.ok(), 'La cuenta administrativa local debe estar inicializada por el seed.').toBeTruthy();
  return context;
}
export async function customerContext(playwright: Playwright, baseURL?: string) {
  const context = await playwright.request.newContext({ baseURL });
  const response = await context.post(apiPath('/auth/register'), { data: newCustomer() });
  expect(response.status()).toBe(201);
  return context;
}
export async function fillAddress(page: Page) {
  await page.getByLabel('Nombre de quien recibe').fill(testAddress.name);
  await page.getByLabel('Teléfono de contacto').fill(testAddress.phone);
  await page.getByLabel('Dirección', { exact: true }).fill(testAddress.line1);
  await page.getByLabel('Ciudad / municipio').fill(testAddress.city);
  await page.getByLabel('Departamento', { exact: true }).fill(testAddress.department);
}
export async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll, `La página ${page.url()} no debe desbordarse horizontalmente.`).toBeLessThanOrEqual(dimensions.width + 1);
}
