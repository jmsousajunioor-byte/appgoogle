import { test, expect } from '@playwright/test';

test('persisted user and cards are restored', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('authUser', JSON.stringify({ id: 'local-user', email: 'local@example.com', fullName: 'Local User' }));
    window.localStorage.setItem('cards', JSON.stringify([
      { id: 'c1', nickname: 'Meu Cartão', brand: 'Visa', last4: '1234', holderName: 'Local User', expiration: '12/28', limit: 5000, dueDateDay: 5, gradient: { start: '#6366f1', end: '#8b5cf6' } }
    ]));
  });

  await page.goto('http://localhost:3002/');
  await page.waitForLoadState('networkidle');

  // Deve renderizar app autenticado e exibir algum elemento do dashboard
  const dashboardHeading = page.locator('text=Dashboard');
  await expect(dashboardHeading).toHaveCount(1);
});
