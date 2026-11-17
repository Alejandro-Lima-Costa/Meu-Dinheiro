import React, { useState, useEffect } from 'react';
import { X, Target, Bell, AlertTriangle, Trash2 } from 'lucide-react';
import { BudgetGoal, TransactionCategory } from '../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: BudgetGoal) => void;
  onDeleteGoal?: (goalId: string) => void;
  existingGoal?: BudgetGoal | null;
  existingCategories: TransactionCategory[];
}

const ALL_EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Assinaturas',
  'Compras',
  'Outros',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  onDeleteGoal,
  existingGoal,
  existingCategories,
}) => {
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [limitStr, setLimitStr] = useState('1000');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  // Synchronize state whenever the modal opens or a different existingGoal is selected
  useEffect(() => {
    if (!isOpen) return;

    if (existingGoal) {
      setCategory(existingGoal.category);
      setLimitStr(existingGoal.monthlyLimit.toString());
      setAlertThreshold(existingGoal.alertThreshold ?? 80);
    } else {
      // Pick first category not yet configured
      const available = ALL_EXPENSE_CATEGORIES.find(c => !existingCategories.includes(c)) || 'Alimentação';
      setCategory(available);
      setLimitStr('1000');
      setAlertThreshold(80);
    }
  }, [existingGoal, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLimit = parseFloat(limitStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanLimit) || cleanLimit <= 0) return;

    // Critical fix: ensure existing goal always retains its target category
    const targetCategory = existingGoal ? existingGoal.category : category;

    const goalToSave: BudgetGoal = {
      id: existingGoal ? existingGoal.id : `goal-${Date.now()}`,
      category: targetCategory,
      monthlyLimit: cleanLimit,
      alertThreshold,
      period: 'monthly',
      isCustom: true,
    };

    onSaveGoal(goalToSave);
    onClose();
  };

  const handleDelete = () => {
    if (!existingGoal || !onDeleteGoal) return;
    if (confirm(`Deseja remover a meta de orçamento para ${existingGoal.category}?`)) {
      onDeleteGoal(existingGoal.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {existingGoal ? `Meta: ${existingGoal.category}` : 'Nova Meta de Orçamento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de meta"
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Categoria Orçada
            </label>
            {existingGoal ? (
              <div className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl py-2.5 px-3.5 text-white text-sm font-semibold flex items-center justify-between">
                <span>{existingGoal.category}</span>
                <span className="text-[11px] text-slate-400 font-normal">Categoria fixa</span>
              </div>
            ) : (
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {ALL_EXPENSE_CATEGORIES.map(cat => (
                  <option
                    key={cat}
                    value={cat}
                    disabled={existingCategories.includes(cat)}
                  >
                    {cat} {existingCategories.includes(cat) ? '(já configurada)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Limite Mensal (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-medium">
                R$
              </span>
              <input
                type="text"
                required
                placeholder="1000,00"
                value={limitStr}
                onChange={e => setLimitStr(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white text-xl font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Gatilho de Alerta Personalizado
              </label>
              <span className="text-xs font-bold font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                {alertThreshold}% do teto
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Você receberá um alerta assim que seus gastos nesta categoria atingirem {alertThreshold}% do valor estipulado.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              O Meu Dinheiro recalcula o consumo em tempo real a cada compra cadastrada ou sincronização bancária.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {existingGoal && onDeleteGoal && (
              <button
                type="button"
                onClick={handleDelete}
                title="Excluir meta"
                aria-label="Excluir meta de orçamento"
                className="h-12 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            )}
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Target className="w-5 h-5" />
              {existingGoal ? 'Atualizar Limite' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
