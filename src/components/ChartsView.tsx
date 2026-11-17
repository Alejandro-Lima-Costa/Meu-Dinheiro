import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  CreditCard as CardIcon,
  Zap,
} from 'lucide-react';
import { Transaction, BudgetGoal, SecuritySettings } from '../types/finance';
import {
  calculateCategoryBreakdown,
  calculateMonthlySummary,
  compareExpensesBetweenPeriods,
  formatCurrency,
  CATEGORY_COLORS,
} from '../utils/calculations';
import { DonutChart } from './DonutChart';
import { CumulativeComparisonChart } from './CumulativeComparisonChart';

interface ChartsViewProps {
  transactions: Transaction[];
  goals: BudgetGoal[];
  security: SecuritySettings;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  transactions,
  goals,
  security,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // default Nov 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const summary = calculateMonthlySummary(transactions, selectedMonth, selectedYear);
  const categories = calculateCategoryBreakdown(transactions, selectedMonth, selectedYear, goals);
  const comparison = compareExpensesBetweenPeriods(transactions, 11, 2026, 10, 2026);

  // Payment method totals for selected month
  const monthlyExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(`${selectedYear}-${selectedMonth < 10 ? '0' : ''}${selectedMonth}`)
  );
  const paymentTotals: Record<string, number> = {
    credit_card: 0,
    pix: 0,
    boleto: 0,
    debit: 0,
    transfer: 0,
  };
  monthlyExpenses.forEach(t => {
    paymentTotals[t.paymentMethod] = (paymentTotals[t.paymentMethod] || 0) + t.amount;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Month Switcher Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Período de Análise
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

      {/* Trajectory Comparison Chart (Real-time Day 1..30 comparison) */}
      <CumulativeComparisonChart
        transactions={transactions}
        currentMonth={11}
        currentYear={2026}
        prevMonth={10}
        prevYear={2026}
        hideValues={security.privacyMode}
      />

      {/* Category Breakdown Donut Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Distribuição por Categoria</h3>
            <p className="text-xs text-slate-400">Gasto total: {formatCurrency(summary.totalExpenses, security.privacyMode)}</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {categories.length} categorias ativas
          </span>
        </div>

        <DonutChart
          categories={categories}
          totalExpense={summary.totalExpenses}
          hideValues={security.privacyMode}
        />
      </div>

      {/* Cashflow Bar Chart: Entradas vs Saídas */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Fluxo de Caixa Mensal</h3>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Saldo: {formatCurrency(summary.netSavings, security.privacyMode)}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {/* Income Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Receitas (Entradas)
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(summary.totalIncome, security.privacyMode)}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 w-full" />
            </div>
          </div>

          {/* Expense Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Despesas (Saídas)
              </span>
              <span className="font-mono font-bold text-rose-400">
                {formatCurrency(summary.totalExpenses, security.privacyMode)}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{
                  width: `${summary.totalIncome > 0 ? Math.min(100, (summary.totalExpenses / summary.totalIncome) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Taxa de poupança */}
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between mt-3">
            <span className="text-xs text-slate-300">Taxa de Poupança do Período</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {summary.savingsRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-3">Despesas por Método de Pagamento</h3>
        <div className="space-y-2">
          {[
            { label: 'Cartão de Crédito', key: 'credit_card', color: 'bg-indigo-500' },
            { label: 'Pix Instantâneo', key: 'pix', color: 'bg-teal-500' },
            { label: 'Boleto Bancário', key: 'boleto', color: 'bg-amber-500' },
            { label: 'Débito / TED', key: 'debit', color: 'bg-blue-500' },
          ].map(item => {
            const val = paymentTotals[item.key] || 0;
            const pct = summary.totalExpenses > 0 ? (val / summary.totalExpenses) * 100 : 0;
            return (
              <div key={item.key} className="p-2.5 bg-slate-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-200">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white mr-2">
                    {formatCurrency(val, security.privacyMode)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({pct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
