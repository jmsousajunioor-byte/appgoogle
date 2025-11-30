const { test, expect } = require('@playwright/test');

// Agrupa todos os testes relacionados a login
test.describe('Página de Login', () => {
  // 1) TESTE: login com dados corretos
  test('deve logar com email e senha válidos', async ({ page }) => {
    // Abre a página de login
    await page.goto('http://localhost:3001/login');

    // Preenche o campo de email
    await page.fill('input[name="email"]', 'jmsousajunior@gmail.com');

    // Preenche o campo de senha
    await page.fill('input[name="password"]', 'Senhateste@151');

    // Clica no botão de enviar (entrar)
    await page.click('button[type="submit"]');

    // Aguarda a navegação acontecer, por exemplo para /dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Confere se aparece algum texto típico de usuário logado
    await expect(page.getByText('Bem-vindo de volta junior sousa')).toBeVisible();
  });
});
