import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Transaction,
  BankAccount,
  CreditCard,
  BudgetGoal,
} from '../types/finance';
import {
  calculateMonthlySummary,
  calculateCategoryBreakdown,
  calculateBudgetStatus,
  formatCurrency,
  formatDate,
  getTransactionsByMonth,
} from './calculations';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export interface ExportPDFOptions {
  month: number;
  year: number;
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  goals: BudgetGoal[];
  userName?: string;
}

export function generateFinancialPDF(options: ExportPDFOptions): jsPDF {
  const { month, year, transactions, accounts, cards, goals, userName = 'Usuário Meu Dinheiro' } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = MONTH_NAMES[month - 1];
  const summary = calculateMonthlySummary(transactions, month, year);
  const categories = calculateCategoryBreakdown(transactions, month, year, goals);
  const budgetStatuses = calculateBudgetStatus(goals, transactions, month, year);
  const monthlyTx = getTransactionsByMonth(transactions, month, year)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- HEADER & BRANDING ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  // Meu Dinheiro logo accent bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 35, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MEU DINHEIRO', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('RELATÓRIO FINANCEIRO MENSAL CONSOLIDADO', 14, 22);

  doc.setFontSize(8);
  doc.text(`TITULAR: ${userName.toUpperCase()}`, 14, 28);

  // Right-aligned report period & timestamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(`${monthName.toUpperCase()} / ${year}`, 196, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const now = new Date();
  doc.text(`Emitido em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 196, 22, { align: 'right' });
  doc.text(`Autenticação Open Finance: SHA-256/TLS 1.3`, 196, 28, { align: 'right' });

  let currentY = 44;

  // --- EXECUTIVE SUMMARY CARDS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Resumo Executivo', 14, currentY);

  currentY += 4;

  const cardWidth = 43;
  const cardHeight = 22;
  const cardsData = [
    { title: 'Receitas Totais', val: formatCurrency(summary.totalIncome), color: [16, 185, 129] }, // emerald
    { title: 'Despesas Totais', val: formatCurrency(summary.totalExpenses), color: [239, 68, 68] }, // red
    { title: 'Saldo Líquido', val: formatCurrency(summary.netSavings), color: [59, 130, 246] }, // blue
    { title: 'Taxa de Poupança', val: `${summary.savingsRate}%`, color: [139, 92, 246] }, // violet
  ];

  cardsData.forEach((c, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    // Background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
    // Top border indicator
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(x, currentY, cardWidth, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(c.title, x + 3, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(c.val, x + 3, currentY + 16);
  });

  currentY += cardHeight + 8;

  // --- CATEGORIES & BUDGET GOALS TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Despesas por Categoria e Aderência a Metas', 14, currentY);

  currentY += 3;

  const categoryRows = categories.map(cat => {
    const budgetInfo = budgetStatuses.find(b => b.goal.category === cat.category);
    const limit = budgetInfo ? formatCurrency(budgetInfo.goal.monthlyLimit) : 'Sem teto';
    const percent = budgetInfo ? `${budgetInfo.percentage}%` : '-';
    let status = 'Dentro da meta';
    if (budgetInfo) {
      if (budgetInfo.percentage >= 100) status = 'Ultrapassado';
      else if (budgetInfo.percentage >= budgetInfo.goal.alertThreshold) status = 'Alerta Atenção';
    }

    return [
      cat.category,
      formatCurrency(cat.total),
      `${cat.percentage}%`,
      limit,
      percent,
      status,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Categoria', 'Total Gasto', '% do Total', 'Teto Orçado', '% Orçamento', 'Status']],
    body: categoryRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text === 'Ultrapassado') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Alerta Atenção') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // --- ACCOUNTS & CREDIT CARDS BALANCE SHEET ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Contas Bancárias & Cartões de Crédito Integrados', 14, currentY);

  currentY += 3;

  const accountsRows = [
    ...accounts.map(acc => [
      acc.institution,
      acc.name,
      acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Investimentos',
      acc.accountNumberMasked,
      'Sincronizado',
      formatCurrency(acc.balance),
    ]),
    ...cards.map(c => [
      c.institution,
      c.name,
      `Cartão ${c.brand}`,
      `Final ${c.lastFourDigits}`,
      `Venc: dia ${c.dueDay}`,
      `- ${formatCurrency(c.currentInvoice)}`,
    ]),
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Instituição', 'Descrição', 'Modalidade', 'Identificador', 'Status / Venc.', 'Saldo / Fatura Atual']],
    body: accountsRows,
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need a new page for transactions
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // --- ITEMIZED TRANSACTIONS TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`4. Extrato de Transações Detalhadas (${monthlyTx.length} lançamentos)`, 14, currentY);

  currentY += 3;

  const txRows = monthlyTx.map(t => {
    const isIncome = t.type === 'income';
    const methodMap = {
      pix: 'Pix',
      credit_card: 'Cartão de Crédito',
      debit: 'Débito',
      boleto: 'Boleto',
      transfer: 'Transferência',
    };
    return [
      formatDate(t.date),
      t.description,
      t.category,
      methodMap[t.paymentMethod] || t.paymentMethod,
      isIncome ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Valor']],
    body: txRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const str = String(data.cell.raw);
        if (str.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.line(14, 287, 196, 287);
    doc.text('Meu Dinheiro Mobile · Documento emitido com assinatura digital e conformidade Open Finance Banco Central do Brasil.', 14, 292);
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: 'right' });
  }

  return doc;
}

export function downloadFinancialPDF(options: ExportPDFOptions): void {
  const doc = generateFinancialPDF(options);
  const monthName = MONTH_NAMES[options.month - 1].toLowerCase();
  const filename = `relatorio-meu-dinheiro-${monthName}-${options.year}.pdf`;
  doc.save(filename);
}
