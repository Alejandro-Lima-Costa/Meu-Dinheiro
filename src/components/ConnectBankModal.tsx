import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, RefreshCw, Building2, CreditCard as CardIcon, Lock } from 'lucide-react';
import { BankInstitution, BankAccount, CreditCard } from '../types/finance';

interface ConnectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: BankAccount) => void;
  onAddCard: (card: CreditCard) => void;
}

interface InstitutionOption {
  name: BankInstitution;
  color: string;
  badge: string;
}

const INSTITUTIONS: InstitutionOption[] = [
  { name: 'Nubank', color: '#820AD1', badge: 'Nu Pagamentos S.A.' },
  { name: 'Itaú', color: '#EC7000', badge: 'Itaú Unibanco S.A.' },
  { name: 'Banco Inter', color: '#FF7A00', badge: 'Inter & Co' },
  { name: 'Bradesco', color: '#CC092F', badge: 'Banco Bradesco S.A.' },
  { name: 'Santander', color: '#EC0000', badge: 'Banco Santander Brasil' },
  { name: 'C6 Bank', color: '#242424', badge: 'Banco C6 S.A.' },
  { name: 'BTG Pactual', color: '#1B263B', badge: 'BTG Pactual Banking' },
  { name: 'Banco do Brasil', color: '#0038A8', badge: 'Banco do Brasil S.A.' },
  { name: 'Caixa Econômica', color: '#005CA9', badge: 'Caixa Econômica Federal' },
];

export const ConnectBankModal: React.FC<ConnectBankModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  onAddCard,
}) => {
  const [step, setStep] = useState<'select' | 'authorizing' | 'success'>('select');
  const [selectedInst, setSelectedInst] = useState<InstitutionOption>(INSTITUTIONS[0]);
  const [connectType, setConnectType] = useState<'both' | 'account' | 'card'>('both');
  const [syncStatusText, setSyncStatusText] = useState('Iniciando handshake TLS 1.3...');

  if (!isOpen) return null;

  const handleStartConnection = (inst: InstitutionOption) => {
    setSelectedInst(inst);
    setStep('authorizing');
    setSyncStatusText('Conectando ao gateway Open Finance do Banco Central...');

    setTimeout(() => {
      setSyncStatusText(`Autenticando credenciais seguras em ${inst.name}...`);
    }, 700);

    setTimeout(() => {
      setSyncStatusText('Sincronizando extratos, limites e faturas em tempo real...');
    }, 1400);

    setTimeout(() => {
      // Create new account / card
      const randomAccNum = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1 + Math.random() * 9)}`;
      const randomCardNum = `${Math.floor(1000 + Math.random() * 9000)}`;

      if (connectType === 'both' || connectType === 'account') {
        const newAcc: BankAccount = {
          id: `acc-${Date.now()}`,
          name: `${inst.name} Conta Corrente`,
          institution: inst.name,
          type: 'checking',
          balance: Number((1500 + Math.random() * 7000).toFixed(2)),
          accountNumberMasked: `Ag 0001 · C/C ${randomAccNum}`,
          color: inst.color,
          lastSyncTime: 'Agora mesmo',
          isConnected: true,
          status: 'active',
        };
        onAddAccount(newAcc);
      }

      if (connectType === 'both' || connectType === 'card') {
        const newCard: CreditCard = {
          id: `card-${Date.now()}`,
          name: `${inst.name} Platinum Card`,
          institution: inst.name,
          brand: 'Mastercard',
          limit: 12000,
          currentInvoice: Number((650 + Math.random() * 1200).toFixed(2)),
          availableLimit: 10500,
          closingDay: 8,
          dueDay: 15,
          lastFourDigits: randomCardNum,
          color: inst.color,
          isConnected: true,
          lastSyncTime: 'Agora mesmo',
        };
        onAddCard(newCard);
      }

      setStep('success');
    }, 2100);
  };

  const handleFinish = () => {
    setStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Conectar Instituição</h2>
              <p className="text-xs text-slate-400">Open Finance Brasil Oficial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar conexão bancária"
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'select' && (
          <div className="mt-4 space-y-4">
            {/* Modalidade */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                O que você deseja sincronizar?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setConnectType('both')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    connectType === 'both'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Conta & Cartão
                </button>
                <button
                  type="button"
                  onClick={() => setConnectType('account')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    connectType === 'account'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Somente Conta
                </button>
                <button
                  type="button"
                  onClick={() => setConnectType('card')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    connectType === 'card'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Somente Cartão
                </button>
              </div>
            </div>

            {/* Institution list */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Selecione seu Banco ou Emissor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {INSTITUTIONS.map(inst => (
                  <button
                    key={inst.name}
                    type="button"
                    onClick={() => handleStartConnection(inst)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all text-left group cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: inst.color }}
                    >
                      {inst.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {inst.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{inst.badge}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-slate-300">
                Seus dados são transmitidos com criptografia ponta a ponta (AES-256 / TLS 1.3). O Meu Dinheiro apenas visualiza extratos, sem permissão para movimentação.
              </p>
            </div>
          </div>
        )}

        {step === 'authorizing' && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: selectedInst.color }}
              >
                {selectedInst.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -inset-1.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Conectando ao {selectedInst.name}</h3>
              <p className="text-xs text-emerald-400 mt-1 font-mono">{syncStatusText}</p>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-xl max-w-xs mx-auto text-left flex items-center gap-2 border border-slate-700/50">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-300">
                Canal seguro autenticado via certificados digitais ICP-Brasil
              </span>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Integração Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-300 mt-1">
                A conta e/ou cartão do <strong>{selectedInst.name}</strong> foram sincronizados. Todas as transações foram importadas automaticamente para o seu painel financeiro.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all cursor-pointer"
            >
              Acessar Painel Atualizado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
