import { sendEmail } from '../config/email';

export class EmailService {
  private static baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Bem-vindo! 🚀';
    const html = `<!DOCTYPE html><html><head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style></head><body>
      <div class="container">
        <div class="header"><h1>✨ Bem-vindo!</h1></div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Estamos muito felizes em ter você conosco! 🎉</p>
          <p>Sua conta foi criada com sucesso. Agora você pode aproveitar todos os recursos da nossa plataforma.</p>
          <p>Para começar, clique no botão abaixo:</p>
          <a href="${this.baseUrl}/dashboard" class="button">Acessar Plataforma</a>
          <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
          <p>Atenciosamente,<br>Equipe ${process.env.COMPANY_NAME}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body></html>`;

    await sendEmail({ to, subject, html });
  }

  static async sendEmailVerification(to: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.VERIFY_EMAIL_URL}?token=${token}`;
    const subject = 'Confirme seu email 📧';
    const html = `<!DOCTYPE html><html><head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style></head><body>
      <div class="container">
        <div class="header"><h1>📧 Verificação de Email</h1></div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Para ativar sua conta, precisamos verificar seu endereço de email.</p>
          <p>Clique no botão abaixo para confirmar:</p>
          <a href="${verificationUrl}" class="button">Verificar Email</a>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <div class="warning"><strong>⚠️ Importante:</strong> Este link expira em 24 horas.</div>
          <p>Se você não criou esta conta, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe ${process.env.COMPANY_NAME}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body></html>`;

    await sendEmail({ to, subject, html });
  }

  static async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${token}`;
    const subject = 'Redefinição de Senha 🔑';
    const html = `<!DOCTYPE html><html><head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style></head><body>
      <div class="container">
        <div class="header"><h1>🔑 Redefinir Senha</h1></div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${resetUrl}" class="button">Redefinir Senha</a>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <div class="warning"><strong>⚠️ Importante:</strong> Este link expira em 24 horas.</div>
          <div class="danger">
            <strong>🚨 Não solicitou esta alteração?</strong><br>
            Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá inalterada.
          </div>
          <p>Atenciosamente,<br>Equipe ${process.env.COMPANY_NAME}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body></html>`;

    await sendEmail({ to, subject, html });
  }

  static async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    const subject = 'Senha Alterada com Sucesso ✅';
    const html = `<!DOCTYPE html><html><head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style></head><body>
      <div class="container">
        <div class="header"><h1>✅ Senha Alterada</h1></div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <div class="success"><strong>Senha alterada com sucesso!</strong></div>
          <p>Esta é uma confirmação de que a senha da sua conta foi alterada em ${new Date().toLocaleString('pt-BR')}.</p>
          <div class="danger">
            <strong>Não reconhece esta alteração?</strong><br>
            Se não realizou esta alteração, recomendamos alterar sua senha imediatamente e contatar o suporte.
          </div>
          <p>Atenciosamente,<br>Equipe ${process.env.COMPANY_NAME}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body></html>`;

    await sendEmail({ to, subject, html });
  }
}

