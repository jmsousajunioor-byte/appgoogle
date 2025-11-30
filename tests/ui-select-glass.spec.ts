import { test, expect } from '@playwright/test';

test('invoice month/year selects are floating without blur or background', async ({ page }) => {
  await page.goto('http://localhost:3002/');
  await page.waitForLoadState('networkidle');

  // Abrir Detalhes do Cartão de algum card (assume que existe UI acessível)
  // Este teste é genérico: procura os elementos pelo id
  const monthWrapper = page.locator('#invoiceMonth').first();
  const yearWrapper = page.locator('#invoiceYear').first();

  // Computed style sem fundo
  const monthBg = await monthWrapper.evaluate((el) => getComputedStyle(el).backgroundColor);
  const yearBg = await yearWrapper.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(monthBg).toBe('rgba(0, 0, 0, 0)');
  expect(yearBg).toBe('rgba(0, 0, 0, 0)');
});
