<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DPPBpcU6n3zx_5wFYuEeYNOnplKLVn_N

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Fluxos de senha (Supabase)
- Recuperacao: o botao "Esqueci minha senha" chama `supabase.auth.resetPasswordForEmail` com redirect para `/reset-password`; o link do email sempre abre o formulario, valida os tokens de recovery e so depois atualiza a senha com `supabase.auth.updateUser`.
- Reset seguro: mesmo que o Supabase crie sessao automaticamente, marcamos o modo de recuperacao e mantemos o usuario na rota `/reset-password` ate concluir o processo.
- Troca logado: na pagina de Perfil ha uma secao "Alterar senha" que reautentica com a senha atual via `signInWithPassword` antes de chamar `updateUser`. Exibe estados de carregamento, mensagens de erro e sucesso.
