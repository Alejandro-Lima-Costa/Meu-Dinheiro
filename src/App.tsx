/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  BankAccount,
  CreditCard,
  BudgetGoal,
  BudgetAlert,
  SecuritySettings,
} from './types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_ACCOUNTS,
  INITIAL_CARDS,
  INITIAL_BUDGET_GOALS,
  INITIAL_SECURITY,
} from './data/seedData';
import { generateBudgetAlerts } from './utils/calculations';
import { downloadFinancialPDF } from './utils/pdfExport';
import { Navigation, BottomTabBar, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ChartsView } from './components/ChartsView';
import { BanksAndCardsView } from './components/BanksAndCardsView';
import { BudgetsAndAlertsView } from './components/BudgetsAndAlertsView';
import { ReportsView } from './components/ReportsView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { IncomeModal } from './components/IncomeModal';
import { BudgetModal } from './components/BudgetModal';
import { ConnectBankModal } from './components/ConnectBankModal';
import { SecurityModal } from './components/SecurityModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { Check, ShieldCheck, Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  // Initialize from scratch (app do zero) or from saved user state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finansync_transactions');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return []; // App starts completely clean from zero!
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('finansync_accounts');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return []; // Clean slate: connect accounts on demand
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem('finansync_cards');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return []; // Clean slate: add or connect cards on demand
  });

  const [goals, setGoals] = useState<BudgetGoal[]>(() => {
    try {
      const saved = localStorage.getItem('finansync_goals');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUDGET_GOALS;
  });

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    try {
      const saved = localStorage.getItem('finansync_security');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SECURITY;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);
  const [isConnectBankOpen, setIsConnectBankOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('finansync_transactions', JSON.stringify(transactions));
    } catch (e) { console.error(e); }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('finansync_accounts', JSON.stringify(accounts));
    } catch (e) { console.error(e); }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('finansync_cards', JSON.stringify(cards));
    } catch (e) { console.error(e); }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem('finansync_goals', JSON.stringify(goals));
    } catch (e) { console.error(e); }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('finansync_security', JSON.stringify(security));
    } catch (e) { console.error(e); }
  }, [security]);

  // Real-time alerts generation (recalculated whenever goals or transactions change)
  const currentMonth = 11;
  const currentYear = 2026;
  const alerts = useMemo(() => {
    return generateBudgetAlerts(goals, transactions, currentMonth, currentYear);
  }, [goals, transactions]);

  // Automatic Background Sync Simulation
  useEffect(() => {
    if (!security.autoSync || accounts.length === 0) return;
    const interval = setInterval(() => {
      setAccounts(prev =>
        prev.map(acc => ({ ...acc, lastSyncTime: 'Agora mesmo' }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [security.autoSync, accounts.length]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Update account balance or card current invoice
    if (newTx.type === 'expense') {
      if (newTx.paymentMethod === 'credit_card') {
        setCards(prev =>
          prev.map(c =>
            c.id === newTx.accountId
              ? {
                  ...c,
                  currentInvoice: Number((c.currentInvoice + newTx.amount).toFixed(2)),
                  availableLimit: Number(Math.max(0, c.availableLimit - newTx.amount).toFixed(2)),
                }
              : c
          )
        );
      } else {
        setAccounts(prev =>
          prev.map(a =>
            a.id === newTx.accountId
              ? { ...a, balance: Number((a.balance - newTx.amount).toFixed(2)) }
              : a
          )
        );
      }
    } else {
      // Income
      setAccounts(prev =>
        prev.map(a =>
          a.id === newTx.accountId
            ? { ...a, balance: Number((a.balance + newTx.amount).toFixed(2)) }
            : a
        )
      );
    }

    setSyncToast('Lançamento adicionado e recalculado em tempo real!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    // Revert balance or credit card invoice
    if (txToDelete.type === 'expense') {
      if (txToDelete.paymentMethod === 'credit_card') {
        setCards(prev =>
          prev.map(c =>
            c.id === txToDelete.accountId
              ? {
                  ...c,
                  currentInvoice: Math.max(0, Number((c.currentInvoice - txToDelete.amount).toFixed(2))),
                  availableLimit: Number((c.availableLimit + txToDelete.amount).toFixed(2)),
                }
              : c
          )
        );
      } else {
        setAccounts(prev =>
          prev.map(a =>
            a.id === txToDelete.accountId
              ? { ...a, balance: Number((a.balance + txToDelete.amount).toFixed(2)) }
              : a
          )
        );
      }
    } else {
      // Revert income
      setAccounts(prev =>
        prev.map(a =>
          a.id === txToDelete.accountId
            ? { ...a, balance: Number((a.balance - txToDelete.amount).toFixed(2)) }
            : a
        )
      );
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    setSyncToast('Despesa/Lançamento excluído com sucesso.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    setSyncToast('Cartão excluído com sucesso.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleDeleteAccount = (accId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accId));
    setSyncToast('Conta bancária removida.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleResetToZero = () => {
    setTransactions([]);
    setCards([]);
    setAccounts([]);
    try {
      localStorage.removeItem('finansync_transactions');
      localStorage.removeItem('finansync_cards');
      localStorage.removeItem('finansync_accounts');
    } catch (e) { console.error(e); }
    setSyncToast('Aplicativo zerado com sucesso! Pronto para usar do zero.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleLoadDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setCards(INITIAL_CARDS);
    setGoals(INITIAL_BUDGET_GOALS);
    setSyncToast('Dados de demonstração carregados!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleSaveGoal = (goalToSave: BudgetGoal) => {
    setGoals(prev => {
      const idx = prev.findIndex(g => g.id === goalToSave.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = goalToSave;
        return updated;
      }
      return [...prev, goalToSave];
    });

    setSyncToast('Meta de orçamento e alertas atualizados com sucesso!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    setSyncToast('Meta de orçamento removida.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleAddAccount = (newAcc: BankAccount) => {
    setAccounts(prev => [...prev, newAcc]);
    setSyncToast(`Conta ${newAcc.name} sincronizada via Open Finance!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleAddCard = (newCard: CreditCard) => {
    setCards(prev => [...prev, newCard]);
    setSyncToast(`Cartão ${newCard.name} adicionado ao painel!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncToast('Conectando ao gateway Open Finance e sincronizando extratos...');

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

      setAccounts(prev =>
        prev.map(acc => ({
          ...acc,
          lastSyncTime: `Hoje às ${timeStr}`,
        }))
      );
      setCards(prev =>
        prev.map(c => ({
          ...c,
          lastSyncTime: `Hoje às ${timeStr}`,
        }))
      );

      setIsSyncing(false);
      setSyncToast('Todas as contas e cartões foram sincronizados com sucesso!');
      setTimeout(() => setSyncToast(null), 3500);
    }, 1200);
  };

  const handleDismissAlert = (alertId: string) => {
    setSyncToast('Alerta arquivado.');
    setTimeout(() => setSyncToast(null), 2500);
  };

  const handleExportPDF = () => {
    downloadFinancialPDF({
      month: currentMonth,
      year: currentYear,
      transactions,
      accounts,
      cards,
      goals,
      userName: 'Rando Costa',
    });
    setSyncToast('Relatório Financeiro baixado em PDF!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  // If locked, show authentic smartphone unlock screen
  if (security.isLocked) {
    return (
      <BiometricLockScreen
        onUnlock={() => setSecurity(prev => ({ ...prev, isLocked: false }))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 md:py-6 md:px-4">
      {/* Container wrapper: switches between phone frame and full responsive layout */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isMobileFrame
            ? 'max-w-md bg-slate-900 border border-slate-800 md:rounded-[40px] md:shadow-2xl md:shadow-black/80 overflow-hidden min-h-screen md:min-h-[844px] flex flex-col justify-between'
            : 'max-w-5xl bg-slate-900 md:border md:border-slate-800 md:rounded-3xl p-2 sm:p-4'
        }`}
      >
        <div>
          {/* Smartphone Status Bar (Clock, Wifi, Battery) */}
          {isMobileFrame && (
            <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs text-slate-400 select-none">
              <span className="font-semibold text-white font-mono text-[11px]">
                09:41
              </span>
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto hidden sm:block" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Global Navigation Header */}
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            security={security}
            onTogglePrivacy={() =>
              setSecurity(prev => ({ ...prev, privacyMode: !prev.privacyMode }))
            }
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            alerts={alerts}
            isMobileFrame={isMobileFrame}
            onToggleFrame={() => setIsMobileFrame(prev => !prev)}
          />

          {/* Real-time Toast Notifications */}
          {syncToast && (
            <div className="sticky top-14 z-50 mx-4 my-2 p-3 bg-emerald-500/95 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-4 h-4 shrink-0" />
              <span className="truncate">{syncToast}</span>
            </div>
          )}

          {/* Main Content Area */}
          <main className="p-4">
            {activeTab === 'dashboard' && (
              <DashboardView
                transactions={transactions}
                accounts={accounts}
                cards={cards}
                goals={goals}
                alerts={alerts}
                security={security}
                onOpenNewTransaction={() => setIsNewTxOpen(true)}
                onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
                onOpenConnectBank={() => setIsConnectBankOpen(true)}
                onOpenBudgetModal={() => {
                  setEditingGoal(null);
                  setIsBudgetModalOpen(true);
                }}
                onSyncAll={handleSyncAll}
                isSyncing={isSyncing}
                onExportPDF={handleExportPDF}
                onNavigateTab={setActiveTab}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {activeTab === 'charts' && (
              <ChartsView
                transactions={transactions}
                goals={goals}
                security={security}
              />
            )}

            {activeTab === 'banks' && (
              <BanksAndCardsView
                accounts={accounts}
                cards={cards}
                security={security}
                onOpenConnectModal={() => setIsConnectBankOpen(true)}
                onSyncAll={handleSyncAll}
                isSyncing={isSyncing}
                onDeleteCard={handleDeleteCard}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetsAndAlertsView
                goals={goals}
                alerts={alerts}
                transactions={transactions}
                security={security}
                onOpenCreateGoal={() => {
                  setEditingGoal(null);
                  setIsBudgetModalOpen(true);
                }}
                onEditGoal={goal => {
                  setEditingGoal(goal);
                  setIsBudgetModalOpen(true);
                }}
                onDeleteGoal={handleDeleteGoal}
                onDismissAlert={handleDismissAlert}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                transactions={transactions}
                accounts={accounts}
                cards={cards}
                goals={goals}
                security={security}
              />
            )}
          </main>
        </div>

        {/* Docked Mobile Bottom Tab Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadAlerts={alerts.filter(a => !a.isRead).length}
          isMobileFrame={isMobileFrame}
        />
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        cards={cards}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onAddIncome={handleAddTransaction}
        accounts={accounts}
      />

      <BudgetModal
        key={editingGoal?.id || (isBudgetModalOpen ? 'open-new' : 'closed')}
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingGoal(null);
        }}
        onSaveGoal={handleSaveGoal}
        onDeleteGoal={handleDeleteGoal}
        existingGoal={editingGoal}
        existingCategories={goals.map(g => g.category)}
      />

      <ConnectBankModal
        isOpen={isConnectBankOpen}
        onClose={() => setIsConnectBankOpen(false)}
        onAddAccount={handleAddAccount}
        onAddCard={handleAddCard}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        security={security}
        onUpdateSecurity={newSettings =>
          setSecurity(prev => ({ ...prev, ...newSettings }))
        }
        onResetToZero={handleResetToZero}
        onLoadDemoData={handleLoadDemoData}
      />
    </div>
  );
}
