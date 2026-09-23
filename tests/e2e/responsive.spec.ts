import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers';

test.describe('navegación móvil', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('inicio, menú, búsqueda vacía y acceso conservan el ancho móvil', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('inicio-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const navigation = page.getByRole('navigation', { name: 'Categorías' });
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Ropa', exact: true }).click();
    await expect(page).toHaveURL(/categoria=ropa/);
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Buscar productos' }).click();
    await page.getByRole('textbox', { name: 'Buscar en la boutique' }).fill('sin-resultados-e2e-938271');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page).toHaveURL(/buscar=sin-resultados-e2e-938271/);
    await expect(page.locator('.product-card')).toHaveCount(0);
    await expect(page.getByText(/No encontramos|No hay resultados|Sin resultados/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.goto('/cuenta');
    await expect(page.getByRole('button', { name: 'INGRESAR', exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.goto('/admin');
    await expect(page.getByText(/Inicia sesión|Ingresa|Acceso/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
