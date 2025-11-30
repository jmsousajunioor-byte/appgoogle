## Objetivo
- Recriar o componente de cartão como um produto 3D hiper‑realista, com profundidade, reflexos, materiais premium e interação suave, mantendo compatibilidade com React + TypeScript e Tailwind.

## Arquitetura do Componente
- Criar `components/cards/HyperRealCard.tsx` (React + TS).
- Componentizar elementos internos: `Chip`, `BrandLogo`, `NFCIcon`, `MaskedNumber`, `MetaInfo` (nome/validade/apelido).
- Propagar estado de interação via `useRef` + `useState` + `requestAnimationFrame` (tilt/parallax).

## Props e Temas
- Props: `cardHolderName`, `cardNumber`, `last4Digits?`, `expiry`, `brand`, `nickname?`, `theme: 'glass' | 'metal' | 'gradient'`, `onClick?`.
- Máscara do número: agrupa em 4 blocos, substitui 12 dígitos por `•` e mantém últimos 4.
- Temas visuais: 
  - `glass`: base translúcida com reflexos diagonais, brilho suave e borda interna mínima.
  - `metal`: gradiente metálico (cinza/grafite/dourado), micro‑textura com pattern sutil.
  - `gradient`: premium roxo/azul/dourado com faixa de luz oblíqua.

## Efeitos 3D e Interação
- `perspective(1000px)` no container + `rotateX/rotateY` responsivos ao cursor.
- `scale` em hover (1.04–1.06) com `transition: transform 300ms ease`.
- Sombra múltipla: 
  - Principal: `box-shadow: 0 20px 60px rgba(0,0,0,.25)` (flutuação).
  - Secundária: `0 8px 24px rgba(0,0,0,.15)` + leve `inner-shadow` para relevo.
- Parallax: elementos (chip/logo/número) movem 1–3px conforme cursor (transform translate). 
- Glare/reflexo: camada `::before`/`::after` ou div absoluta com `radial-gradient` e `linear-gradient` controlados por posição do mouse.

## Camadas e Materiais
- Camadas do cartão (z‑index): fundo (material) → reflexos (glare/stripes) → conteúdo (texto/ícones) → realce de borda (opcional). 
- `glass`: `backdrop-filter: blur(6–10px)` com `rgba(255,255,255,.1–.18)` (tema claro) ou `hsl(var(--card)/.18)` (escuro).
- `metal`: gradiente multi‑parada (grafite/steel/dourado) + `repeating-linear-gradient` fino para micro‑textura em baixa opacidade.
- `gradient`: paleta roxo/azul/dourado com faixa de luz `linear-gradient( to bottom‑right, rgba(255,255,255,.12), transparent )`.

## Detalhes Reais do Cartão
- Chip metálico com sombra interna (`inset`), borda e brilho leve.
- Ícone NFC próximo ao chip com opacidade sutil.
- Número com espaçamento realista (tracking), fonte monoespaçada legível.
- Nome em caixa alta, validade com `VALID THRU`. 
- Logo da bandeira (Visa/Mastercard/Amex/Elo/Hipercard), posicionamento adaptável por breakpoint.
- Apelido opcional exibido no topo.

## Responsividade
- Proporção fixa: `aspect-[1.586]` (crédito padrão) com `w-full` dentro de contêiner responsivo.
- Tipografia: `clamp(0.9rem, 1.1vw, 1.1rem)` para textos; números em `clamp(1.2rem, 2vw, 1.6rem)`.
- Quebras: reorganizar blocos em `sm` para manter legibilidade; reduzir deslocamentos de parallax em mobile (ou desabilitar tilt em touch).

## Acessibilidade e Usabilidade
- `role="img"` + `aria-label` descrevendo informações principais do cartão.
- `tabIndex` condicional para foco; `onKeyDown` para interações básicas (se houver).
- Evitar scroll horizontal no container; garantir contraste adequado em todos os temas.

## Tailwind/CSS
- Utilizar classes utilitárias existentes (rounded‑2xl, aspect, shadow, backdrop). 
- Acrescentar utilitários locais (no `index.css` ou CSS module) para:
  - Faixa de brilho (`.card-glare`).
  - Micro‑textura (`.card-texture`).
  - Sombra multi‑camadas (`.shadow-hero`).
- Sem dependências externas; compatibilidade com navegadores modernos, incluir `-webkit-` para `backdrop-filter`.

## Estrutura do JSX (resumo)
- `div.card` (container 3D) 
  - `div.materialLayer` (tema atual)
  - `div.glareLayer` (reflexos)
  - `div.content` 
    - `div.topRow` (apelido + logo)
    - `div.middle` (chip + NFC + número)
    - `div.bottom` (nome + validade)

## API de Props (TS)
- `HyperRealCardProps`: conforme seção Props e Temas; `brand: 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard'`. 
- Função util para mascarar número e mapear logos.

## Entregáveis
- Componente `HyperRealCard.tsx` pronto para uso, com comentários em PT‑BR explicando 3D, sombras, gradientes e uso de dados dinâmicos.
- Pequenas melhorias de UX: placeholder quando dados faltarem; estado de loading com shimmer; fallback de logo.

## Validação
- Testar em desktop (1080p–4K), tablet e mobile; checar performance (FPS) e suavidade de transições.
- Verificar contraste e legibilidade em tema claro/escuro.

Confirma que posso implementar conforme este plano?