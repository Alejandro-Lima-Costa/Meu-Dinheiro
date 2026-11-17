# Meu Dinheiro — Gestão Financeira Inteligente

Aplicativo financeiro mobile-first desenvolvido para oferecer controle completo sobre finanças pessoais, combinando acompanhamento de gastos e rendas em tempo real, gráficos comparativos intuitivos, metas de orçamento com alertas inteligentes, gestão de bancos e cartões e exportação de relatórios em PDF.

---

## Finalidade do Aplicativo

O **Meu Dinheiro** foi criado para simplificar o planejamento financeiro pessoal direto no celular (ou em tela cheia no computador), permitindo que o usuário inicie **totalmente do zero** e construa seu controle com dados reais:

- **Controle de Rendas e Despesas**: Registro rápido de salários, trabalhos freelance, dividendos, rendas extras e gastos diários por categoria e forma de pagamento (Pix, Cartão de Crédito, Débito, Boleto e Transferência), com exclusão individual e recálculo instantâneo.
- **Gráficos e Comparativos em Tempo Real**:
  - Curva cumulativa comparando a evolução dos gastos dia a dia entre o mês atual e o anterior.
  - Gráfico de distribuição por categoria (Donut Chart) e fluxo de caixa mensal (entradas vs. saídas e taxa de poupança).
- **Metas de Orçamento e Alertas Personalizados**: Definição de tetos de gastos mensais por categoria com percentual de alerta configurável (ex.: notificar ao atingir 80% do limite).
- **Bancos & Cartões (Open Finance)**: Cadastro e gerenciamento de contas bancárias e cartões de crédito com acompanhamento de limite disponível, fatura atual, dias de fechamento/vencimento e sincronização.
- **Segurança e Privacidade**:
  - Tela de bloqueio com PIN e simulação de autenticação biométrica (Touch ID / Face ID).
  - Modo Privacidade no cabeçalho para ocultar valores financeiros na tela com um toque.
- **Relatórios Mensais e Exportação em PDF**: Geração de relatórios consolidados com balanço do período, cumprimento de metas, faturas e extrato analítico pronto para download em PDF.

---

## Tecnologias Utilizadas

### Core & Linguagem
- **React 19** (`react`, `react-dom`) — Biblioteca principal para construção da interface modular baseada em componentes e hooks.
- **TypeScript** (`typescript`) — Tipagem estática para maior segurança nos cálculos financeiros e estruturas de dados.
- **Vite 8** (`vite`, `@vitejs/plugin-react`) — Empacotador e servidor de desenvolvimento de alta velocidade.

### Interface & Estilização
- **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`) — Estilização utilitária responsiva com suporte a modo Smartphone (enquadrado) e Tela Cheia (Desktop).
- **Lucide React** (`lucide-react`) — Conjunto de ícones vetoriais leves e consistentes.
- **Motion** (`motion`) — Animações e transições fluidas de interface.
- **Google Fonts** (`Plus Jakarta Sans` e `JetBrains Mono`) — Tipografia otimizada para leitura e alinhamento numérico de valores monetários.

### Visualização de Dados & Documentos
- **Gráficos SVG Nativos** — Componentes customizados (`DonutChart` e `CumulativeComparisonChart`) para renderização responsiva sem dependências pesadas.
- **jsPDF & jsPDF-AutoTable** (`jspdf`, `jspdf-autotable`) — Geração client-side de relatórios financeiros estruturados em PDF.

### Persistência & Qualidade
- **Web Storage API (`localStorage`)** — Armazenamento local automático de transações, contas, cartões, metas e preferências de segurança no navegador.
- **Node.js Test Runner + tsx** (`node:test`, `tsx`) — Testes unitários automatizados para validação das regras de cálculo financeiro, formatação em BRL e alertas de orçamento.

---

## Estrutura Principal do Projeto

```text
src/
├── components/
│   ├── BanksAndCardsView.tsx       # Gestão de contas bancárias e cartões de crédito
│   ├── BiometricLockScreen.tsx     # Tela de bloqueio por PIN e biometria
│   ├── BudgetModal.tsx             # Modal de criação/edição/exclusão de metas
│   ├── BudgetsAndAlertsView.tsx    # Painel de metas por categoria e alertas ativos
│   ├── ChartsView.tsx              # Visão analítica com gráficos comparativos
│   ├── ConnectBankModal.tsx        # Fluxo de conexão Open Finance e cadastro de cartão
│   ├── CumulativeComparisonChart.tsx # Gráfico SVG comparativo diário entre meses
│   ├── DashboardView.tsx           # Painel inicial com saldo, rendas e transações
│   ├── DonutChart.tsx              # Gráfico SVG de distribuição por categoria
│   ├── IncomeModal.tsx             # Modal dedicado ao cadastro de rendas e salários
│   ├── Navigation.tsx              # Cabeçalho global e barra de navegação inferior
│   ├── NewTransactionModal.tsx     # Modal de lançamento de despesas e receitas
│   ├── ReportsView.tsx             # Pré-visualização de relatórios mensais
│   └── SecurityModal.tsx           # Central de segurança, reset e dados de exemplo
├── data/
│   └── seedData.ts                 # Modelos iniciais de metas e dados opcionais de exemplo
├── types/
│   └── finance.ts                  # Interfaces e tipos TypeScript do domínio financeiro
├── utils/
│   ├── calculations.ts             # Funções puras de resumo mensal, metas e alertas
│   ├── calculations.test.ts        # Suite de testes unitários dos cálculos
│   └── pdfExport.ts                # Gerador e exportador de relatórios em PDF
├── App.tsx                         # Estado global, persistência e orquestração das abas
└── index.css                       # Configuração global do Tailwind CSS
```

---

## Como Executar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento** (porta `3000`):
   ```bash
   npm run dev
   ```

3. **Verificar tipagem TypeScript**:
   ```bash
   npm run lint
   ```

4. **Executar os testes unitários**:
   ```bash
   npx tsx --test src/utils/calculations.test.ts
   ```

5. **Gerar build de produção**:
   ```bash
   npm run build
   ```
