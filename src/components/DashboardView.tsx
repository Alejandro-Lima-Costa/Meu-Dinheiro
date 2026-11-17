import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard as CardIcon,
  Plus,
  RefreshCw,
  FileDown,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  ChevronRight,
  Wallet,
  Building2,
  Lock,
  Trash2,
  Coins,
} from 'lucide-react';
import {
  Transaction,
  BankAccount,
  CreditCard,
  BudgetGoal,
  BudgetAlert,
  SecuritySettings,
} from '../types/finance';
import {
  formatCurrency,
  formatDate,
  calculateMonthlySummary,
  compareExpensesBetweenPeriods,
  CATEGORY_COLORS,
} from '../utils/calculations';

interface DashboardViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  goals: BudgetGoal[];
  alerts: BudgetAlert[];
  security: SecuritySettings;
  onOpenNewTransaction: () => void;
  onOpenIncomeModal: () => void;
  onOpenConnectBank: () => void;
  onOpenBudgetModal: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onExportPDF: () => void;
  onNavigateTab: (tab: 'charts' | 'banks' | 'budgets' | 'reports') => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  accounts,
  cards,
  goals,
  alerts,
  security,
  onOpenNewTransaction,
  onOpenIncomeModal,
  onOpenConnectBank,
  onOpenBudgetModal,
  onSyncAll,
  isSyncing,
  onExportPDF,
  onNavigateTab,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'expense' | 'income'>('all');

  const currentMonth = 11;
  const currentYear = 2026;
  const summary = calculateMonthlySummary(transactions, currentMonth, currentYear);
  const comparison = compareExpensesBetweenPeriods(transactions, currentMonth, currentYear, 10, 2026);

  // Incomes for current month
  const monthlyIncomes = transactions.filter(
    t => t.type === 'income' && t.date.startsWith(`${currentYear}-${currentMonth < 10 ? '0' : ''}${currentMonth}`)
  );

  // Total balance across all bank accounts
  const totalBankBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Filtered recent transactions
  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedFilter === 'all' ? true : t.type === selectedFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="space-y-4 pb-20">
      {/* Consolidated Master Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow backdrop subtle */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Patrimônio Líquido Disponível
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Novembro 2026
          </span>
        </div>

        {/* Big Balance Number */}
        <div className="flex items-baseline gap-2 mt-1">
          <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {formatCurrency(totalBankBalance, security.privacyMode)}
          </h1>
        </div>

        {/* Real-time comparison badge vs previous month */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-xs">
            {comparison.isReduced ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                Despesas {Math.abs(comparison.percentageChange)}% menores que outubro
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Despesas +{comparison.percentageChange}% em relação a outubro
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onOpenIncomeModal}
            title="Adicionar ou gerenciar rendas mensais"
            className="bg-slate-800/60 hover:bg-slate-800 p-2 rounded-xl border border-slate-700/40 text-left transition-colors cursor-pointer group"
          >
            <span className="text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
                Receitas
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold group-hover:underline">+ Renda</span>
            </span>
            <p className="text-[11px] sm:text-xs font-bold font-mono text-emerald-400 mt-1 truncate" title={formatCurrency(summary.totalIncome, security.privacyMode)}>
              {formatCurrency(summary.totalIncome, security.privacyMode)}
            </p>
          </button>

          <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3 text-rose-400 shrink-0" />
              Despesas
            </span>
            <p className="text-[11px] sm:text-xs font-bold font-mono text-rose-400 mt-1 truncate" title={formatCurrency(summary.totalExpenses, security.privacyMode)}>
              {formatCurrency(summary.totalExpenses, security.privacyMode)}
            </p>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <CardIcon className="w-3 h-3 text-indigo-400 shrink-0" />
              Faturas
            </span>
            <p className="text-[11px] sm:text-xs font-bold font-mono text-indigo-300 mt-1 truncate" title={formatCurrency(summary.creditCardTotal, security.privacyMode)}>
              {formatCurrency(summary.creditCardTotal, security.privacyMode)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onOpenNewTransaction}
          aria-label="Registrar novo gasto"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 mb-1 text-rose-400" />
          <span className="text-[11px] leading-tight">+ Gasto</span>
        </button>

        <button
          onClick={onOpenIncomeModal}
          aria-label="Adicionar renda ou salário"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Coins className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-tight">+ Renda</span>
        </button>

        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-white font-medium border border-slate-700/80 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 mb-1 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-[11px] leading-tight">
            {isSyncing ? 'Sincronizando' : 'Sincronizar'}
          </span>
        </button>

        <button
          onClick={onExportPDF}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-white font-medium border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
        >
          <FileDown className="w-5 h-5 mb-1 text-indigo-400" />
          <span className="text-[11px] leading-tight">PDF</span>
        </button>
      </div>

      {/* Dedicated Monthly Incomes & Salaries Section */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rendas Mensais & Salários</h3>
              <p className="text-[10px] text-slate-400">Total do mês: {formatCurrency(summary.totalIncome, security.privacyMode)}</p>
            </div>
          </div>

          <button
            onClick={onOpenIncomeModal}
            aria-label="Cadastrar nova renda ou salário"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Renda</span>
          </button>
        </div>

        {monthlyIncomes.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center">
            <Coins className="w-6 h-6 text-emerald-400/60 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma renda cadastrada em Novembro</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Adicione seu salário, rendimentos ou rendas extras para calcular seu saldo real e taxa de poupança.
            </p>
            <button
              onClick={onOpenIncomeModal}
              className="mt-3 px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Salário / Renda
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {monthlyIncomes.map(inc => {
              const targetAcc = accounts.find(a => a.id === inc.accountId);
              return (
                <div
                  key={inc.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4 font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate">{inc.description}</p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                          {inc.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDate(inc.date, true)} · {targetAcc ? `${targetAcc.institution} (${targetAcc.name})` : 'Carteira Principal'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      + {formatCurrency(inc.amount, security.privacyMode)}
                    </span>

                    <button
                      onClick={() => onDeleteTransaction(inc.id)}
                      title={`Excluir renda ${inc.description}`}
                      aria-label={`Excluir renda ${inc.description}`}
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Alerts Banner (if any) */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  {activeAlerts.length} {activeAlerts.length === 1 ? 'Alerta de Orçamento' : 'Alertas de Orçamento Ativos'}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-snug">
                  {activeAlerts[0].message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0 underline ml-2 cursor-pointer"
            >
              Ajustar
            </button>
          </div>
        </div>
      )}

      {/* Connected Accounts & Cards Preview */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Bancos & Cartões Conectados</h3>
          </div>
          <button
            onClick={() => onNavigateTab('banks')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 cursor-pointer"
          >
            Gerenciar
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {accounts.length === 0 && cards.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center">
            <p className="text-xs text-slate-300 font-medium">Nenhum banco ou cartão cadastrado</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Conecte sua conta bancária ou adicione seu cartão.</p>
            <button
              onClick={onOpenConnectBank}
              className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              + Conectar Instituição
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {accounts.slice(0, 2).map(acc => (
              <div
                key={acc.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.institution.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-400">{acc.accountNumberMasked}</p>
                  </div>
                </div>
                <p className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                  {formatCurrency(acc.balance, security.privacyMode)}
                </p>
              </div>
            ))}

            {cards.slice(0, 1).map(c => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    <CardIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400">Venc. dia {c.dueDay} · Final {c.lastFourDigits}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-bold text-rose-400">
                    {formatCurrency(c.currentInvoice, security.privacyMode)}
                  </p>
                  <p className="text-[9px] text-slate-400">fatura atual</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions List with Search & Filter */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Transações Recentes</h3>
          <span className="text-xs text-slate-400">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'lançamento' : 'lançamentos'}
          </span>
        </div>

        {/* Search & Filter bar */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-800/60 rounded-xl">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedFilter('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setSelectedFilter('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-slate-850 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-white">Nenhum gasto ou receita registrado</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                O aplicativo está zerado e pronto para o seu controle financeiro real.
              </p>
              <button
                onClick={onOpenNewTransaction}
                className="mt-3 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Novo Gasto
              </button>
            </div>
          ) : (
            filteredTransactions.map(tx => {
              const isIncome = tx.type === 'income';
              const catColor = CATEGORY_COLORS[tx.category] || '#94A3B8';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${catColor}20` }}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span>{formatDate(tx.date, true)}</span>
                        <span>·</span>
                        <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <div className="text-right">
                      <p
                        className={`text-xs font-mono font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(tx.amount, security.privacyMode)}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {tx.status === 'completed' ? 'Efetivado' : 'Pendente'}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Excluir despesa"
                      aria-label={`Excluir lançamento ${tx.description}`}
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
