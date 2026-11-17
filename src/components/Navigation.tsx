import React from 'react';
import {
  Home,
  PieChart as PieIcon,
  Building2,
  Target,
  FileText,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { SecuritySettings, BudgetAlert } from '../types/finance';

export type TabType = 'dashboard' | 'charts' | 'banks' | 'budgets' | 'reports';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  security: SecuritySettings;
  onTogglePrivacy: () => void;
  onOpenSecurityModal: () => void;
  alerts: BudgetAlert[];
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  security,
  onTogglePrivacy,
  onOpenSecurityModal,
  alerts,
  isMobileFrame,
  onToggleFrame,
}) => {
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <>
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md shadow-emerald-500/20">
            MD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">Meu Dinheiro</span>
              <span className="text-[10px] text-emerald-400 font-mono">Mobile</span>
            </div>
            <p className="text-[10px] text-slate-400">Open Finance Brasil</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Desktop/Mobile Frame Toggle */}
          <button
            onClick={onToggleFrame}
            title={isMobileFrame ? 'Expandir para Tela Cheia' : 'Enquadrar como Smartphone'}
            aria-label="Alternar modo de visualização tela ou smartphone"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors cursor-pointer"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Privacy Toggle (Hide/Show Balances) */}
          <button
            onClick={onTogglePrivacy}
            title={security.privacyMode ? 'Mostrar Saldos' : 'Ocultar Saldos (Privacidade)'}
            aria-label="Alternar visibilidade de saldos"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
              security.privacyMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {security.privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Security Center trigger */}
          <button
            onClick={onOpenSecurityModal}
            title="Central de Segurança Criptografada"
            aria-label="Abrir central de segurança"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-emerald-400 flex items-center justify-center border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => onTabChange('budgets')}
            title="Alertas de Metas"
            aria-label="Ver alertas de metas"
            className="relative w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadAlerts}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
};

export const BottomTabBar: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadAlerts: number;
  isMobileFrame: boolean;
}> = ({ activeTab, onTabChange, unreadAlerts, isMobileFrame }) => {
  return (
    <nav
      aria-label="Navegação Principal"
      className={`z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 py-2 px-3 ${
        isMobileFrame
          ? 'sticky bottom-0 w-full rounded-b-[40px] md:rounded-b-[38px]'
          : 'sticky bottom-0 w-full'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        <button
          onClick={() => onTabChange('dashboard')}
          aria-label="Ir para Início"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Início</span>
        </button>

        <button
          onClick={() => onTabChange('charts')}
          aria-label="Ir para Gráficos"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'charts'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Gráficos</span>
        </button>

        <button
          onClick={() => onTabChange('banks')}
          aria-label="Ir para Bancos e Cartões"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'banks'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Bancos</span>
        </button>

        <button
          onClick={() => onTabChange('budgets')}
          aria-label="Ir para Metas e Alertas"
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'budgets'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Metas</span>
          {unreadAlerts > 0 && (
            <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onTabChange('reports')}
          aria-label="Ir para Relatórios"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Relatórios</span>
        </button>
      </div>
    </nav>
  );
};
