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

interface TermsOfServiceModalProps {
  children: React.ReactNode;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ children }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[80vh] bg-gradient-to-br from-purple-950/95 to-blue-950/95 backdrop-blur-xl border-purple-500/50 text-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Termos de Uso
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6 text-gray-200 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">1. Aceitação dos Termos</h3>
            <p>
              Ao acessar e usar este aplicativo/serviço, você aceita e concorda em estar vinculado aos termos e
              condições aqui estabelecidos. Se você não concorda com estes termos, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">2. Descrição do Serviço</h3>
            <p>
              Nosso serviço oferece funcionalidades financeiras inteligentes, com experiências de controle de gastos,
              cartões e insights. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto do
              serviço a qualquer momento para manutenção ou evolução do produto.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">3. Cadastro e Conta</h3>
            <p>Você se responsabiliza por fornecer informações verdadeiras, manter sua senha segura e ser maior de 18 anos.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Manter dados atualizados</li>
              <li>Notificar sobre uso não autorizado</li>
              <li>Responder por atividades realizadas em sua conta</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">4. Uso Aceitável</h3>
            <p>É proibido utilizar o serviço para atividades ilegais, transmissão de conteúdo ofensivo ou para ataques.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Não tente obter acesso não autorizado</li>
              <li>Não faça engenharia reversa ou distribua malwares</li>
              <li>Não colete dados de terceiros sem consentimento</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">5. Propriedade Intelectual</h3>
            <p>
              Todo conteúdo (logos, textos, layouts, ícones) pertence à empresa. É proibida a cópia ou distribuição não
              autorizada.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">6. Privacidade e LGPD</h3>
            <p>
              Respeitamos a LGPD e coletamos apenas os dados necessários para prover nossos serviços, conforme descrito na
              Política de Privacidade.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">7. Suspensão</h3>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou apresentem comportamento
              suspeito.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">8. Isenção de Garantias</h3>
            <p>O serviço é fornecido "como está", sem garantias de disponibilidade contínua ou ausência total de falhas.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">9. Limitação de Responsabilidade</h3>
            <p>
              Não nos responsabilizamos por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso do
              serviço.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">10. Indenização</h3>
            <p>
              Você concorda em indenizar a empresa por danos decorrentes de uso indevido do serviço ou violação destes
              termos.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">11. Modificações</h3>
            <p>
              Atualizações serão comunicadas por email ou avisos dentro do produto. O uso contínuo representa aceitação das
              mudanças.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">12. Lei Aplicável</h3>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será tratada na jurisdição competente do
              Brasil.
            </p>
          </section>

          <section className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="font-semibold text-purple-200">
              Ao marcar "Aceito os Termos de Uso" você declara ter lido, compreendido e concordado com estas condições.
            </p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export default TermsOfServiceModal;
