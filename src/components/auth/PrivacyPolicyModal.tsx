import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyPolicyModalProps {
  children: React.ReactNode;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ children }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[80vh] bg-gradient-to-br from-purple-950/95 to-blue-950/95 backdrop-blur-xl border-purple-500/50 text-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Política de Privacidade e LGPD
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6 text-gray-200 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Introdução</h3>
            <p>
              Esta política descreve como coletamos, usamos e protegemos seus dados de acordo com a LGPD. Ao utilizar o
              serviço você concorda com as práticas aqui descritas.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">1. Controlador e DPO</h3>
            <p>
              Controlador: Sua Empresa LTDA — contato@seudominio.com.br. Encarregado (DPO): dpo@seudominio.com.br para
              solicitações relacionadas aos dados.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">2. Dados Coletados</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Cadastro: nome, email, CPF, telefone, data de nascimento</li>
              <li>Uso automático: IP, dispositivo, logs de acesso e preferências</li>
              <li>Consentimentos registrados para LGPD</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">3. Finalidades</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Gerenciar sua conta e autenticação</li>
              <li>Executar serviços contratados e análises</li>
              <li>Cumprir obrigações legais e prevenir fraudes</li>
              <li>Enviar comunicações (marketing somente com consentimento)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">4. Compartilhamento</h3>
            <p>
              Compartilhamos dados com provedores de infraestrutura, analytics e autoridades quando necessário, sempre
              seguindo a LGPD e acordos contratuais de confidencialidade.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">5. Segurança</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Criptografia em trânsito e repouso</li>
              <li>Acesso restrito com autenticação forte</li>
              <li>Monitoramento, backups e plano de resposta a incidentes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">6. Retenção</h3>
            <p>
              Mantemos os dados pelo tempo necessário para cumprimento das finalidades e obrigações legais. Após esse
              período, os dados são anonimizados ou excluídos de forma segura.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">7. Direitos do Titular</h3>
            <p>
              Você pode solicitar confirmação, acesso, correção, portabilidade, anonimização ou exclusão dos dados pelo
              email dpo@seudominio.com.br. Respondemos em até 15 dias.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">8. Cookies</h3>
            <p>
              Utilizamos cookies para autenticação, preferências e analytics. Você pode gerenciá-los no navegador, mas isso
              pode impactar a experiência.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">9. Alterações</h3>
            <p>
              Mudanças relevantes serão comunicadas por email ou avisos dentro do app. Recomendamos revisar esta política
              periodicamente.
            </p>
          </section>

          <section className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="font-semibold text-purple-200">
              Ao aceitar a Política de Privacidade você consente com o tratamento descrito e reconhece seus direitos previstos
              na LGPD.
            </p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export default PrivacyPolicyModal;
