import React from 'react';
import {
  X,
  Shield,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  CheckCircle,
  FileCheck,
  Smartphone,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { SecuritySettings } from '../types/finance';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  security: SecuritySettings;
  onUpdateSecurity: (newSettings: Partial<SecuritySettings>) => void;
  onResetToZero: () => void;
  onLoadDemoData: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  security,
  onUpdateSecurity,
  onResetToZero,
  onLoadDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Central de Segurança</h2>
              <p className="text-xs text-slate-400">Proteção de Nível Bancário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar central de segurança"
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Security Status Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-slate-800/80 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Ambiente 100% Protegido
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                TLS 1.3 · AES-256
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Todas as conexões bancárias e transações são criptografadas localmente com tokens de acesso temporários e imutáveis.
            </p>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                {security.privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Modo Privacidade</p>
                <p className="text-xs text-slate-400">Ocultar valores e saldos em locais públicos</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSecurity({ privacyMode: !security.privacyMode })}
              aria-label="Alternar modo privacidade"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                security.privacyMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  security.privacyMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Biometric Lock Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bloqueio Biométrico / PIN</p>
                <p className="text-xs text-slate-400">Exigir FaceID, TouchID ou PIN para abrir o app</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSecurity({ biometricEnabled: !security.biometricEnabled })}
              aria-label="Alternar bloqueio biométrico"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                security.biometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  security.biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Auto-Sync Settings */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sincronização Automática</p>
                <p className="text-xs text-slate-400">Buscar novas transações em segundo plano</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSecurity({ autoSync: !security.autoSync })}
              aria-label="Alternar sincronização automática"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                security.autoSync ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  security.autoSync ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Open Finance Consent Info */}
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Consentimento Open Finance
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Finalidade: Consolidação de saldos e emissão de alertas orçamentários.</p>
              <p>• Validade: Até {new Date(security.openFinanceConsentValidUntil).toLocaleDateString('pt-BR')}.</p>
              <p>• Órgão regulador: Banco Central do Brasil (Resolução Conjunta nº 1/2020).</p>
            </div>
          </div>

          {/* Reset / Data Management Section */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Gerenciamento de Dados</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Controle total para zerar seu aplicativo ou carregar dados demonstrativos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja zerar o aplicativo? Todas as despesas e cartões cadastrados serão apagados.')) {
                    onResetToZero();
                    onClose();
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Zerar App (Começar do Zero)
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadDemoData();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Carregar Dados de Exemplo
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
