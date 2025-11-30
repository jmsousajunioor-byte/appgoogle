## Auditoria
- Revisar estilos do modal e resets: `components/ui/Modal.tsx` e `index.css`.
- Mapear todos os locais com selects: 
  - Modal Detalhes → `components/cards/tabs/InvoicesTab.tsx`.
  - Invoices modal/page → `components/pages/InvoicesPage.tsx`.
  - Relatórios → `components/pages/ReportsPage.tsx`.
- Identificar interferências: backgrounds `bg-white`, `bg-neutral-50/100` dentro do modal e estilo nativo do `<select>` no Windows.

## Problema Raiz
- `<select>` nativo em Windows/Chromium mantém aparência do SO e ignora transparência/blur.
- Fundos sólidos de wrappers (ex.: `UICard` com `bg-white`/`dark:bg-neutral-900`) criam caixas cinzas atrás dos controles.

## Solução Técnica
- Estratégia container-first: aplicar efeito glass no CONTAINER e manter o `<select>` transparente.
- Criar um wrapper reutilizável (classe utilitária ou ajuste no componente `Select`):
  - Wrapper: `bg-white/10 dark:bg-neutral-800/20 backdrop-blur-md border-white/20 dark:border-neutral-700/30 rounded-md shadow-sm px-3 py-2`.
  - Select interno: `bg-transparent border-transparent outline-none w-full text-neutral-800 dark:text-neutral-100 appearance-none`.
  - Adicionar seta customizada via pseudo-elemento/SVG para aparência consistente.
- No escopo do modal (`.modal-glass`), reforçar transparência de `bg-white`, `bg-neutral-50/100`.

## Aplicações
- Atualizar `components/ui/Select.tsx` para renderizar o wrapper glass e o `<select>` transparente.
- Usar `Select` em `InvoicesTab` do modal Detalhes (já mapeado), substituindo nativos.
- Padronizar filtros em `InvoicesPage.tsx` e `ReportsPage.tsx` com o mesmo componente/wrapper.

## Verificação
- Rodar servidor dev e validar visualmente no modal Detalhes (aba Faturas) e nas páginas.
- Testar dark/light mode, foco (`ring-indigo`) e acessibilidade (labels, `aria-label`).
- Checar em Chromium/Windows especificamente.

## Entregáveis
- Selects no modal com verdadeiro efeito glass (sem caixas cinzas), consistente com o restante do modal.
- Componente `Select` reutilizável com wrapper glass, aplicado onde houver selects.

Confirma aplicar essa solução container-first no componente `Select` e substituir os selects nativos do modal e páginas citadas?