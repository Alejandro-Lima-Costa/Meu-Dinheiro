import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard as CardIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  BankAccount,
  CreditCard,
} from '../types/finance';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  accounts: BankAccount[];
  cards: CreditCard[];
}

const CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Assinaturas',
  'Compras',
  'Salário',
  'Investimentos',
  'Outros',
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  cards,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [accountId, setAccountId] = useState(accounts[0]?.id || cards[0]?.id || 'carteira-padrao');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) return;
    if (!description.trim()) return;

    const newTx: Transaction = {
      id: `tx-user-${Date.now()}`,
      date,
      description: description.trim(),
      amount: cleanAmount,
      type,
      category,
      accountId,
      paymentMethod,
      status: 'completed',
      notes: notes.trim() || undefined,
    };

    onAddTransaction(newTx);
    onClose();
    // reset
    setDescription('');
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Novo Lançamento</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de nova transação"
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type selector: Despesa vs Receita */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Salário') setCategory('Alimentação');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salário');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-medium">
                R$
              </span>
              <input
                type="text"
                required
                placeholder="0,00"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white text-xl font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Almoço restaurante, Posto Shell, Salário..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {type === 'expense' ? (
                  CATEGORIES.filter(c => !['Salário', 'Freelance', 'Renda Extra', 'Aluguel'].includes(c)).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Salário">Salário (CLT / PJ)</option>
                    <option value="Freelance">Freelance / Serviços</option>
                    <option value="Investimentos">Investimentos & Dividendos</option>
                    <option value="Aluguel">Aluguel / Renda Passiva</option>
                    <option value="Renda Extra">Renda Extra / Bônus</option>
                    <option value="Outros">Outras Entradas</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Data
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

          {/* Account / Card & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Conta / Cartão
              </label>
              <select
                value={accountId}
                onChange={e => {
                  setAccountId(e.target.value);
                  const isCard = cards.some(c => c.id === e.target.value);
                  if (isCard) setPaymentMethod('credit_card');
                }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {accounts.length === 0 && cards.length === 0 ? (
                  <option value="carteira-padrao">Carteira / Dinheiro</option>
                ) : (
                  <>
                    {accounts.length > 0 && (
                      <optgroup label="Contas Bancárias">
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.institution} - {acc.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {type === 'expense' && cards.length > 0 && (
                      <optgroup label="Cartões de Crédito">
                        {cards.map(card => (
                          <option key={card.id} value={card.id}>
                            {card.name} (Final {card.lastFourDigits})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="pix">Pix Instantâneo</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit">Débito em Conta</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="transfer">Transferência / TED</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Adicionar nota..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
