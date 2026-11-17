import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  Transaction,
  BankAccount,
  CreditCard,
  BudgetGoal,
  SecuritySettings,
} from '../types/finance';
import {
  calculateMonthlySummary,
  calculateCategoryBreakdown,
  calculateBudgetStatus,
  formatCurrency,
  formatDate,
  getTransactionsByMonth,
} from '../utils/calculations';
import { downloadFinancialPDF } from '../utils/pdfExport';

interface ReportsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  goals: BudgetGoal[];
  security: SecuritySettings;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  accounts,
  cards,
  goals,
  security,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(11);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const summary = calculateMonthlySummary(transactions, selectedMonth, selectedYear);
  const categories = calculateCategoryBreakdown(transactions, selectedMonth, selectedYear, goals);
  const monthlyTx = getTransactionsByMonth(transactions, selectedMonth, selectedYear)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Fixed vs Variable expenses estimation (Moradia & Assinaturas = fixed)
  const fixedExpenses = categories
    .filter(c => c.category === 'Moradia' || c.category === 'Assinaturas' || c.category === 'Educação')
    .reduce((acc, c) => acc + c.total, 0);
  const variableExpenses = Math.max(0, summary.totalExpenses - fixedExpenses);

  const handleExportPDF = () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      downloadFinancialPDF({
        month: selectedMonth,
        year: selectedYear,
        transactions,
        accounts,
        cards,
        goals,
        userName: 'Rando Costa',
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Month Selector Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Mês do Relatório
          </span>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl">
          <button
            onClick={() => { setSelectedMonth(11); setSelectedYear(2026); }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedMonth === 11
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Novembro 2026
          </button>
          <button
            onClick={() => { setSelectedMonth(10); setSelectedYear(2026); }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedMonth === 10
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Outubro 2026
          </button>
        </div>
      </div>

      {/* Prominent Export to PDF Card */}
      <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-emerald-950/40 border border-indigo-500/30 rounded-3xl shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Relatório Mensal Consolidado</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {MONTH_NAMES[selectedMonth - 1]} de {selectedYear} · {monthlyTx.length} transações
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            PDF Oficial
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Documento estruturado pronto para impressão e arquivamento fiscal contendo balanço patrimonial, extrato analítico de despesas, cumprimento de metas e faturas de cartões.
        </p>

        {exportSuccess && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Arquivo PDF gerado e baixado com sucesso para o seu dispositivo!
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-5 h-5" />
            {isExporting ? 'Compilando Relatório...' : 'Baixar Relatório em PDF'}
          </button>
        </div>
      </div>

      {/* Financial Health Diagnostic */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Diagnóstico Financeiro do Mês</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Taxa de Poupança</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {summary.savingsRate}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {summary.savingsRate >= 20 ? 'Excelente (acima de 20%)' : 'Abaixo do recomendado'}
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Saldo Líquido</span>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {formatCurrency(summary.netSavings, security.privacyMode)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Superávit no período</p>
          </div>
        </div>

        {/* Fixed vs Variable breakdown */}
        <div className="mt-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300">Despesas Fixas vs Variáveis</span>
            <span className="font-mono text-slate-400 text-[11px]">
              Fixas: {((fixedExpenses / (summary.totalExpenses || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${(fixedExpenses / (summary.totalExpenses || 1)) * 100}%` }}
              title="Despesas Fixas"
            />
            <div
              className="h-full bg-amber-500"
              style={{ width: `${(variableExpenses / (summary.totalExpenses || 1)) * 100}%` }}
              title="Despesas Variáveis"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Fixas: {formatCurrency(fixedExpenses, security.privacyMode)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Variáveis: {formatCurrency(variableExpenses, security.privacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Table Preview */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Extrato de Despesas por Categoria</h3>
          <span className="text-xs text-slate-400">{categories.length} grupos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-semibold">Categoria</th>
                <th className="pb-2 font-semibold text-right">Lançamentos</th>
                <th className="pb-2 font-semibold text-right">% Total</th>
                <th className="pb-2 font-semibold text-right">Valor Gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map(cat => (
                <tr key={cat.category} className="hover:bg-slate-800/40">
                  <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.category}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {cat.count}x
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {cat.percentage}%
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-white">
                    {formatCurrency(cat.total, security.privacyMode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 3 Highest Expenses */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Maiores Despesas Individuais</h3>
        <div className="space-y-2">
          {monthlyTx
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
            .map((tx, idx) => (
              <div
                key={tx.id}
                className="p-3 bg-slate-800/40 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(tx.date)} · {tx.category}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 shrink-0 ml-2">
                  {formatCurrency(tx.amount, security.privacyMode)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
