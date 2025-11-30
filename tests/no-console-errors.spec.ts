import { test, expect } from '@playwright/test';

test('app loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3002/');
  await page.waitForLoadState('domcontentloaded');

  expect(errors.length, `Console errors: ${errors.join('\n')}`).toBe(0);
});
