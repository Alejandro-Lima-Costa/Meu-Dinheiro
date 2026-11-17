import React from 'react';
import {
  Target,
  Bell,
  AlertTriangle,
  Plus,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Trash2,
} from 'lucide-react';
import { BudgetGoal, BudgetAlert, Transaction, SecuritySettings } from '../types/finance';
import { calculateBudgetStatus, formatCurrency, CATEGORY_COLORS } from '../utils/calculations';

interface BudgetsAndAlertsViewProps {
  goals: BudgetGoal[];
  alerts: BudgetAlert[];
  transactions: Transaction[];
  security: SecuritySettings;
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: BudgetGoal) => void;
  onDeleteGoal?: (goalId: string) => void;
  onDismissAlert: (alertId: string) => void;
}

export const BudgetsAndAlertsView: React.FC<BudgetsAndAlertsViewProps> = ({
  goals,
  alerts,
  transactions,
  security,
  onOpenCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onDismissAlert,
}) => {
  const currentMonth = 11;
  const currentYear = 2026;
  const budgetStatuses = calculateBudgetStatus(goals, transactions, currentMonth, currentYear);

  const totalLimit = goals.reduce((acc, g) => acc + g.monthlyLimit, 0);
  const totalSpent = budgetStatuses.reduce((acc, s) => acc + s.spent, 0);
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const dangerCount = budgetStatuses.filter(s => s.status === 'danger').length;
  const warningCount = budgetStatuses.filter(s => s.status === 'warning').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header Health Summary */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Metas & Limites de Orçamento</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Novembro 2026</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Total Consumido</span>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {formatCurrency(totalSpent, security.privacyMode)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Teto Planejado</span>
            <p className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
              {formatCurrency(totalLimit, security.privacyMode)}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-rose-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs mt-1.5">
            <span className="text-slate-400 font-mono">
              {overallPercentage.toFixed(1)}% utilizado do orçamento global
            </span>
            <span className="font-semibold text-emerald-400">
              Restam {formatCurrency(Math.max(0, totalLimit - totalSpent), security.privacyMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Alertas Ativos em Tempo Real</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {alerts.length} notificações
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/40 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-300">Todas as metas estão sob controle!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nenhuma categoria atingiu os gatilhos de alerta configurados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map(alert => {
              const isDanger = alert.type === 'danger';
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDanger
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isDanger ? (
                        <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {alert.category}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isDanger
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {alert.percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="text-[11px] font-medium text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Categorized Goals List */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Detalhamento por Categoria</h3>
          <span className="text-xs text-slate-400">{budgetStatuses.length} metas ativas</span>
        </div>

        {budgetStatuses.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center">
            <p className="text-xs font-semibold text-slate-300">Nenhuma meta por categoria cadastrada</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Defina limites mensais para alimentação, moradia, transporte e receba alertas automáticos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgetStatuses.map(item => {
              const catColor = CATEGORY_COLORS[item.goal.category] || '#94A3B8';
              const isDanger = item.status === 'danger';
              const isWarning = item.status === 'warning';

              return (
                <div
                  key={item.goal.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.goal.category}</h4>
                        <p className="text-[10px] text-slate-400">
                          Alerta dispara com {item.goal.alertThreshold}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="text-right mr-1">
                        <p className="text-xs font-mono font-bold text-white">
                          {formatCurrency(item.spent, security.privacyMode)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          de {formatCurrency(item.goal.monthlyLimit, security.privacyMode)}
                        </p>
                      </div>

                      <button
                        onClick={() => onEditGoal(item.goal)}
                        title={`Editar limite de ${item.goal.category}`}
                        aria-label={`Editar meta de ${item.goal.category}`}
                        className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteGoal && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a meta de ${item.goal.category}?`)) {
                              onDeleteGoal(item.goal.id);
                            }
                          }}
                          title={`Excluir meta de ${item.goal.category}`}
                          aria-label={`Excluir meta de ${item.goal.category}`}
                          className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDanger
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-1 text-slate-400">
                    <span className="font-mono">
                      {item.percentage}% consumido
                    </span>
                    <span>
                      {item.remaining >= 0
                        ? `Restam ${formatCurrency(item.remaining, security.privacyMode)}`
                        : `Excedido em ${formatCurrency(Math.abs(item.remaining), security.privacyMode)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* New Budget Goal Button */}
      <button
        onClick={onOpenCreateGoal}
        className="w-full h-12 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        Definir Nova Meta de Orçamento
      </button>
    </div>
  );
};
