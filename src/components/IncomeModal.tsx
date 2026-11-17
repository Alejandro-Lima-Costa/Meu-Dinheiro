import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Landmark, Coins, ArrowUpRight, Sparkles } from 'lucide-react';
import {
  Transaction,
  TransactionCategory,
  BankAccount,
} from '../types/finance';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (transaction: Transaction) => void;
  accounts: BankAccount[];
}

interface IncomePreset {
  label: string;
  defaultDescription: string;
  category: TransactionCategory;
}

const INCOME_PRESETS: IncomePreset[] = [
  { label: 'Salário Mensal', defaultDescription: 'Salário mensal líquido', category: 'Salário' },
  { label: 'Adiantamento / Vale', defaultDescription: 'Adiantamento salarial', category: 'Salário' },
  { label: 'Freelance / Serviços', defaultDescription: 'Projeto freelance', category: 'Freelance' },
  { label: 'Rendimentos / FIIs', defaultDescription: 'Dividendos e juros de aplicações', category: 'Investimentos' },
  { label: 'Renda Passiva / Aluguel', defaultDescription: 'Recebimento de aluguel', category: 'Aluguel' },
  { label: 'Renda Extra / Bônus', defaultDescription: 'Bônus / renda extra', category: 'Renda Extra' },
];

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  accounts,
}) => {
  const [description, setDescription] = useState('Salário mensal líquido');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Salário');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'carteira-padrao');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: IncomePreset) => {
    setDescription(preset.defaultDescription);
    setCategory(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;
    if (!description.trim()) return;

    const incomeTx: Transaction = {
      id: `tx-income-${Date.now()}`,
      date,
      description: description.trim(),
      amount: cleanAmount,
      type: 'income',
      category,
      accountId: accounts.some(a => a.id === accountId) ? accountId : (accounts[0]?.id || 'carteira-padrao'),
      paymentMethod: 'transfer',
      status: 'completed',
      notes: notes.trim() || undefined,
    };

    onAddIncome(incomeTx);
    onClose();
    // reset form
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Adicionar Renda Mensal</h2>
              <p className="text-xs text-slate-400">Salários, dividendos, freelance e rendas extras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de renda"
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Sugestões Rápidas de Renda
          </span>
          <div className="flex flex-wrap gap-1.5">
            {INCOME_PRESETS.map(preset => {
              const isSelected = category === preset.category && description === preset.defaultDescription;
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Valor da Renda (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-lg">
                R$
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="0,00"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-emerald-400 text-2xl font-mono font-bold placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Descrição da Fonte
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Salário da Empresa X, Projeto Y, etc."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Tipo de Renda
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Salário">Salário (CLT / PJ)</option>
                <option value="Freelance">Freelance / Prestação de Serviços</option>
                <option value="Investimentos">Investimentos & Dividendos</option>
                <option value="Aluguel">Aluguel / Renda Passiva</option>
                <option value="Renda Extra">Renda Extra / Bônus</option>
                <option value="Outros">Outras Entradas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Data de Crédito
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Receiving Account */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-400" />
              Conta de Destino (Onde caiu o dinheiro?)
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {accounts.length === 0 ? (
                <option value="carteira-padrao">Carteira Principal / Dinheiro em Conta</option>
              ) : (
                accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.institution} - {acc.name} ({acc.accountNumberMasked})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Já com descontos de INSS/IR, ou comissão do mês..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              Confirmar Renda Mensal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
