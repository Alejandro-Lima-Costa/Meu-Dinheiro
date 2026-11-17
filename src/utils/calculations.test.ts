import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatDate,
  calculateMonthlySummary,
  calculateCategoryBreakdown,
  calculateBudgetStatus,
  generateBudgetAlerts,
  calculateDailyCumulativeExpense,
  compareExpensesBetweenPeriods,
} from './calculations';
import { Transaction, BudgetGoal } from '../types/finance';

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-11-02',
    description: 'Salário Mensal',
    amount: 10000,
    type: 'income',
    category: 'Salário',
    accountId: 'acc-1',
    paymentMethod: 'transfer',
    status: 'completed',
  },
  {
    id: 'tx-2',
    date: '2026-11-03',
    description: 'Supermercado Pão de Açúcar',
    amount: 850,
    type: 'expense',
    category: 'Alimentação',
    accountId: 'card-1',
    paymentMethod: 'credit_card',
    status: 'completed',
  },
  {
    id: 'tx-3',
    date: '2026-11-05',
    description: 'Aluguel & Condomínio',
    amount: 2500,
    type: 'expense',
    category: 'Moradia',
    accountId: 'acc-1',
    paymentMethod: 'pix',
    status: 'completed',
  },
  {
    id: 'tx-4',
    date: '2026-11-10',
    description: 'Restaurante Jantar',
    amount: 250,
    type: 'expense',
    category: 'Alimentação',
    accountId: 'card-1',
    paymentMethod: 'credit_card',
    status: 'completed',
  },
  {
    id: 'tx-5',
    date: '2026-11-12',
    description: 'Show de Música',
    amount: 600,
    type: 'expense',
    category: 'Lazer',
    accountId: 'card-1',
    paymentMethod: 'credit_card',
    status: 'completed',
  },
  // October transaction for comparison
  {
    id: 'tx-prev-1',
    date: '2026-10-02',
    description: 'Salário Outubro',
    amount: 10000,
    type: 'income',
    category: 'Salário',
    accountId: 'acc-1',
    paymentMethod: 'transfer',
    status: 'completed',
  },
  {
    id: 'tx-prev-2',
    date: '2026-10-05',
    description: 'Despesas Outubro',
    amount: 4000,
    type: 'expense',
    category: 'Moradia',
    accountId: 'acc-1',
    paymentMethod: 'pix',
    status: 'completed',
  },
];

const mockGoals: BudgetGoal[] = [
  {
    id: 'goal-1',
    category: 'Alimentação',
    monthlyLimit: 1000,
    alertThreshold: 80,
    period: 'monthly',
  },
  {
    id: 'goal-2',
    category: 'Lazer',
    monthlyLimit: 500,
    alertThreshold: 80,
    period: 'monthly',
  },
  {
    id: 'goal-3',
    category: 'Moradia',
    monthlyLimit: 3000,
    alertThreshold: 80,
    period: 'monthly',
  },
];

test('formatCurrency formats BRL currency correctly', () => {
  const result = formatCurrency(1250.5);
  assert.ok(result.includes('1.250,50') || result.includes('1250,50'));
  assert.ok(result.includes('R$'));

  const hidden = formatCurrency(1250.5, true);
  assert.equal(hidden, 'R$ ••••••');
});

test('calculateMonthlySummary computes income, expenses, and savings rate', () => {
  const summary = calculateMonthlySummary(mockTransactions, 11, 2026);
  assert.equal(summary.totalIncome, 10000);
  // Total expenses: 850 + 2500 + 250 + 600 = 4200
  assert.equal(summary.totalExpenses, 4200);
  assert.equal(summary.netSavings, 5800);
  assert.equal(summary.savingsRate, 58);
  // Credit card: 850 + 250 + 600 = 1700
  assert.equal(summary.creditCardTotal, 1700);
});

test('calculateCategoryBreakdown organizes expenses by category with percentages', () => {
  const breakdown = calculateCategoryBreakdown(mockTransactions, 11, 2026, mockGoals);
  assert.ok(breakdown.length >= 3);
  
  const moradia = breakdown.find(b => b.category === 'Moradia');
  assert.ok(moradia);
  assert.equal(moradia?.total, 2500);

  const alimentacao = breakdown.find(b => b.category === 'Alimentação');
  assert.ok(alimentacao);
  assert.equal(alimentacao?.total, 1100); // 850 + 250
});

test('calculateBudgetStatus detects safe, warning, and danger limits', () => {
  const status = calculateBudgetStatus(mockGoals, mockTransactions, 11, 2026);
  
  // Alimentação: spent 1100 of 1000 -> 110% -> danger
  const alimentacao = status.find(s => s.goal.category === 'Alimentação');
  assert.ok(alimentacao);
  assert.equal(alimentacao?.status, 'danger');
  assert.equal(alimentacao?.percentage, 110);

  // Lazer: spent 600 of 500 -> 120% -> danger
  const lazer = status.find(s => s.goal.category === 'Lazer');
  assert.ok(lazer);
  assert.equal(lazer?.status, 'danger');

  // Moradia: spent 2500 of 3000 -> 83.3% -> warning (alertThreshold is 80)
  const moradia = status.find(s => s.goal.category === 'Moradia');
  assert.ok(moradia);
  assert.equal(moradia?.status, 'warning');
});

test('generateBudgetAlerts creates actionable alerts for threshold triggers', () => {
  const alerts = generateBudgetAlerts(mockGoals, mockTransactions, 11, 2026);
  assert.ok(alerts.length >= 2);
  
  const dangerAlerts = alerts.filter(a => a.type === 'danger');
  assert.ok(dangerAlerts.length >= 2);
  assert.ok(dangerAlerts.some(a => a.category === 'Alimentação'));
  assert.ok(dangerAlerts.some(a => a.category === 'Lazer'));
});

test('compareExpensesBetweenPeriods calculates delta between months', () => {
  const comparison = compareExpensesBetweenPeriods(mockTransactions, 11, 2026, 10, 2026);
  // Nov expenses: 4200, Oct expenses: 4000
  assert.equal(comparison.currentTotal, 4200);
  assert.equal(comparison.prevTotal, 4000);
  assert.equal(comparison.diffAmount, 200);
  assert.equal(comparison.isReduced, false);
});

test('handles clean state with zero transactions gracefully', () => {
  const summary = calculateMonthlySummary([], 11, 2026);
  assert.equal(summary.totalIncome, 0);
  assert.equal(summary.totalExpenses, 0);
  assert.equal(summary.netSavings, 0);
  assert.equal(summary.savingsRate, 0);
  assert.equal(summary.creditCardTotal, 0);

  const breakdown = calculateCategoryBreakdown([], 11, 2026, mockGoals);
  assert.equal(breakdown.length, 0);

  const alerts = generateBudgetAlerts(mockGoals, [], 11, 2026);
  assert.equal(alerts.length, 0);

  const comparison = compareExpensesBetweenPeriods([], 11, 2026, 10, 2026);
  assert.equal(comparison.currentTotal, 0);
  assert.equal(comparison.prevTotal, 0);
  assert.equal(comparison.diffAmount, 0);
});

test('handles multiple income sources (salário, freelance, aluguel, investimentos)', () => {
  const incomes: Transaction[] = [
    {
      id: 'inc-1',
      date: '2026-11-05',
      description: 'Salário CLT',
      amount: 6500,
      type: 'income',
      category: 'Salário',
      accountId: 'acc-1',
      paymentMethod: 'transfer',
      status: 'completed',
    },
    {
      id: 'inc-2',
      date: '2026-11-10',
      description: 'Projeto Freelance UX',
      amount: 2200,
      type: 'income',
      category: 'Freelance',
      accountId: 'acc-1',
      paymentMethod: 'pix',
      status: 'completed',
    },
    {
      id: 'inc-3',
      date: '2026-11-15',
      description: 'Aluguel Imóvel',
      amount: 1500,
      type: 'income',
      category: 'Aluguel',
      accountId: 'acc-1',
      paymentMethod: 'transfer',
      status: 'completed',
    },
  ];

  const summary = calculateMonthlySummary(incomes, 11, 2026);
  assert.equal(summary.totalIncome, 10200);
  assert.equal(summary.totalExpenses, 0);
  assert.equal(summary.netSavings, 10200);
  assert.equal(summary.savingsRate, 100);
});

