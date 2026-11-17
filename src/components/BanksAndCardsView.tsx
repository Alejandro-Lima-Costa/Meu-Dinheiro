import React from 'react';
import {
  Building2,
  CreditCard as CardIcon,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowRight,
  Wifi,
  Trash2,
} from 'lucide-react';
import { BankAccount, CreditCard, SecuritySettings } from '../types/finance';
import { formatCurrency } from '../utils/calculations';

interface BanksAndCardsViewProps {
  accounts: BankAccount[];
  cards: CreditCard[];
  security: SecuritySettings;
  onOpenConnectModal: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onDeleteCard: (id: string) => void;
  onDeleteAccount: (id: string) => void;
}

export const BanksAndCardsView: React.FC<BanksAndCardsViewProps> = ({
  accounts,
  cards,
  security,
  onOpenConnectModal,
  onSyncAll,
  isSyncing,
  onDeleteCard,
  onDeleteAccount,
}) => {
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalInvoices = cards.reduce((acc, c) => acc + c.currentInvoice, 0);
  const totalLimits = cards.reduce((acc, c) => acc + c.limit, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Open Finance Status & Sync Bar */}
      <div className="p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">Open Finance Brasil</h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Ativo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Sincronização automática com {accounts.length} contas e {cards.length} cartões.
            </p>
          </div>
        </div>

        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Todas as Contas'}
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Saldo Total Bancário
          </span>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1 truncate">
            {formatCurrency(totalBalance, security.privacyMode)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Disponível em {accounts.length} contas</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <CardIcon className="w-3.5 h-3.5 text-indigo-400" />
            Faturas em Aberto
          </span>
          <p className="text-lg font-bold font-mono text-rose-400 mt-1 truncate">
            {formatCurrency(totalInvoices, security.privacyMode)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Limite total: {formatCurrency(totalLimits, security.privacyMode)}</p>
        </div>
      </div>

      {/* Credit Cards Section */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CardIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Cartões de Crédito Integrados</h3>
          </div>
          <span className="text-xs text-slate-400">{cards.length} ativos</span>
        </div>

        <div className="space-y-3">
          {cards.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center">
              <CardIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Nenhum cartão cadastrado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Você pode adicionar ou sincronizar seus cartões de crédito quando desejar.
              </p>
            </div>
          ) : (
            cards.map(card => {
              const usagePct = (card.currentInvoice / card.limit) * 100;
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-700/60 shadow-md relative overflow-hidden"
                >
                  {/* Top card strip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: card.color }}
                      >
                        {card.institution.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{card.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          •••• •••• •••• {card.lastFourDigits} · {card.brand}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Wifi className="w-3 h-3 rotate-90" />
                        Sync OK
                      </div>
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        title="Excluir este cartão"
                        aria-label={`Excluir cartão ${card.name}`}
                        className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Invoice and Limit info */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Fatura Atual
                      </span>
                      <p className="text-base font-bold font-mono text-rose-400">
                        {formatCurrency(card.currentInvoice, security.privacyMode)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Limite Disponível
                      </span>
                      <p className="text-base font-bold font-mono text-white">
                        {formatCurrency(card.availableLimit, security.privacyMode)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar of limit usage */}
                  <div className="mt-2">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePct > 80 ? 'bg-rose-500' : usagePct > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Uso: {usagePct.toFixed(0)}% do limite</span>
                      <span>Vencimento: dia {card.dueDay} · Fecha: dia {card.closingDay}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Contas Bancárias</h3>
          </div>
          <span className="text-xs text-slate-400">{accounts.length} conectadas</span>
        </div>

        <div className="space-y-2.5">
          {accounts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Nenhuma conta bancária cadastrada</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Conecte sua conta para integrar seus saldos automaticamente.
              </p>
            </div>
          ) : (
            accounts.map(acc => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.institution.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{acc.accountNumberMasked}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Conectado
                      </span>
                      <span>·</span>
                      <span>Sync: {acc.lastSyncTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">
                      {formatCurrency(acc.balance, security.privacyMode)}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Investimento'}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    title="Excluir esta conta"
                    aria-label={`Excluir conta ${acc.name}`}
                    className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connect New Institution Button */}
      <button
        onClick={onOpenConnectModal}
        className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        Conectar Nova Conta ou Cartão de Crédito
      </button>
    </div>
  );
};
