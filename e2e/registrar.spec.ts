import { test, expect } from '@playwright/test';

test('registra una jornada de aceptación', async ({ page }) => {
  await page.goto('/registrar');
  await expect(page.getByRole('heading', { name: 'Nueva jornada' })).toBeVisible();
  await page.getByLabel('Entrada').fill('08:00');
  await page.getByLabel('Salida').fill('17:30');
  await page.getByLabel('Descanso (min)').fill('60');
  await expect(page.getByText('Total estimado:')).toBeVisible();
});
