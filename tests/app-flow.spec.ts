import { test, expect } from '@playwright/test';

// Ajuste estas URLs e seletores conforme necessário para o seu app.
// Estou assumindo que a aplicação roda em http://localhost:5173 (padrão do Vite).
// Se for diferente, podemos trocar depois.

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3001';

// Credenciais de teste - ajuste para um usuário válido no seu backend/Supabase
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'jmsousajunior@gmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'Senhateste@151';

// Seletores básicos usados em Login.tsx / LoginForm.tsx
// Você pode depois refiná-los com data-testid se preferir.

async function doLogin(page) {
  await page.goto(`${BASE_URL}/login`);

  // Tenta localizar campos comuns de login (por placeholder ou name)
  const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[name="email"]'));
  const passwordInput = page.getByPlaceholder(/senha|password/i).or(page.locator('input[name="password"]'));

  await emailInput.fill(TEST_EMAIL);
  await passwordInput.fill(TEST_PASSWORD);

  // Botão de login
  const loginButton = page.getByRole('button', { name: /entrar|login|acessar/i });
  await loginButton.click();

  // Aguarda redirecionar para dashboard (ajuste rota caso seja diferente)
  await page.waitForURL((url) => /dashboard/i.test(url.pathname));
}

// 1) Teste da página de Login (Login.tsx + LoginForm.tsx)
test('Login - renderiza e permite autenticação', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await expect(page.getByText(/login|acessar conta|entrar/i).first()).toBeVisible();

  await doLogin(page);

  await expect(page.getByText(/dashboard|visão geral|resumo/i).first()).toBeVisible();
});

// 2) Teste da página Dashboard (DashboardPage.tsx)
test('Dashboard - exibe cards/resumos principais após login', async ({ page }) => {
  await doLogin(page);

  // Ajuste os textos abaixo para o que aparece no seu Dashboard
  await expect(page.getByText(/resumo financeiro|saldo|gastos do mês/i).first()).toBeVisible();
  await expect(page.getByText(/transações recentes|últimas transações/i).first()).toBeVisible();
});

// 3) Teste da página de Dashboard de Cartões (CardsDashboardPage.tsx)
test('Cards Dashboard - lista cartões e métricas principais', async ({ page }) => {
  await doLogin(page);

  // Navega até a rota de dashboard de cartões
  // Ajuste o path caso seja outro (ex: /cartoes/dashboard ou /cards)
  await page.goto(`${BASE_URL}/cards/dashboard`);

  // Ajustar textos de acordo com o que aparece em CardsDashboardPage
  await expect(page.getByText(/cartões de crédito|dashboard de cartões|limite utilizado/i).first()).toBeVisible();
  await expect(page.getByText(/faturas|próxima fatura|gastos no cartão/i).first()).toBeVisible();
});
