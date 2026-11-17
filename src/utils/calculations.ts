import {
  Transaction,
  BudgetGoal,
  BudgetAlert,
  MonthlySummary,
  CategoryExpense,
  TransactionCategory,
} from '../types/finance';

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Alimentação: '#F59E0B', // amber
  Moradia: '#6366F1',    // indigo
  Transporte: '#3B82F6', // blue
  Lazer: '#EC4899',      // pink
  Saúde: '#10B981',      // emerald
  Educação: '#8B5CF6',   // violet
  Assinaturas: '#06B6D4',// cyan
  Compras: '#F97316',    // orange
  Salário: '#22C55E',    // green
  Investimentos: '#14B8A6', // teal
  Freelance: '#10B981',  // emerald
  'Renda Extra': '#34D399', // mint
  Aluguel: '#059669',    // dark green
  Outros: '#64748B',     // slate
};

/**
 * Format a number as Brazilian Real (BRL)
 */
export function formatCurrency(amount: number, hide: boolean = false): string {
  if (hide) return 'R$ ••••••';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date string (YYYY-MM-DD) to pt-BR format (DD/MM/YYYY or DD MMM)
 */
export function formatDate(dateStr: string, shortMonth: boolean = false): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  if (shortMonth) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Filters transactions by month and year (date format: YYYY-MM-DD)
 */
export function getTransactionsByMonth(
  transactions: Transaction[],
  month: number, // 1-12
  year: number
): Transaction[] {
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const prefix = `${year}-${monthStr}`;
  return transactions.filter(t => t.date.startsWith(prefix));
}

/**
 * Calculates monthly financial summary: income, expenses, savings, and savings rate
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  month: number,
  year: number
): MonthlySummary {
  const monthlyTx = getTransactionsByMonth(transactions, month, year);

  let totalIncome = 0;
  let totalExpenses = 0;
  let creditCardTotal = 0;

  for (const tx of monthlyTx) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (tx.paymentMethod === 'credit_card') {
        creditCardTotal += tx.amount;
      }
    }
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  return {
    month,
    year,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netSavings: Number(netSavings.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(1)),
    creditCardTotal: Number(creditCardTotal.toFixed(2)),
  };
}

/**
 * Computes expense distribution across categories for a given month
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  month: number,
  year: number,
  goals: BudgetGoal[] = []
): CategoryExpense[] {
  const monthlyTx = getTransactionsByMonth(transactions, month, year).filter(t => t.type === 'expense');

  const totals: Partial<Record<TransactionCategory, { amount: number; count: number }>> = {};
  let totalExpense = 0;

  for (const tx of monthlyTx) {
    totalExpense += tx.amount;
    if (!totals[tx.category]) {
      totals[tx.category] = { amount: 0, count: 0 };
    }
    totals[tx.category]!.amount += tx.amount;
    totals[tx.category]!.count += 1;
  }

  const results: CategoryExpense[] = [];
  const goalMap = new Map(goals.map(g => [g.category, g.monthlyLimit]));

  for (const [cat, data] of Object.entries(totals) as [TransactionCategory, { amount: number; count: number }][]) {
    const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
    results.push({
      category: cat,
      total: Number(data.amount.toFixed(2)),
      percentage: Number(percentage.toFixed(1)),
      count: data.count,
      budgetLimit: goalMap.get(cat),
      color: CATEGORY_COLORS[cat] || '#94A3B8',
    });
  }

  // Sort descending by total spent
  return results.sort((a, b) => b.total - a.total);
}

/**
 * Calculates budget status for each configured goal and evaluates alert levels
 */
export function calculateBudgetStatus(
  goals: BudgetGoal[],
  transactions: Transaction[],
  month: number,
  year: number
): {
  goal: BudgetGoal;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}[] {
  const monthlyExpenses = getTransactionsByMonth(transactions, month, year).filter(t => t.type === 'expense');

  const spentByCategory = new Map<TransactionCategory, number>();
  for (const tx of monthlyExpenses) {
    const current = spentByCategory.get(tx.category) || 0;
    spentByCategory.set(tx.category, current + tx.amount);
  }

  return goals.map(goal => {
    const spent = Number((spentByCategory.get(goal.category) || 0).toFixed(2));
    const remaining = Number((goal.monthlyLimit - spent).toFixed(2));
    const percentage = goal.monthlyLimit > 0 ? Number(((spent / goal.monthlyLimit) * 100).toFixed(1)) : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) {
      status = 'danger';
    } else if (percentage >= goal.alertThreshold) {
      status = 'warning';
    }

    return {
      goal,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}

/**
 * Generates actionable budget alerts based on defined thresholds
 */
export function generateBudgetAlerts(
  goals: BudgetGoal[],
  transactions: Transaction[],
  month: number,
  year: number
): BudgetAlert[] {
  const statuses = calculateBudgetStatus(goals, transactions, month, year);
  const alerts: BudgetAlert[] = [];

  for (const item of statuses) {
    if (item.status === 'danger') {
      const overspent = item.spent - item.goal.monthlyLimit;
      alerts.push({
        id: `alert-danger-${item.goal.id}-${month}-${year}`,
        goalId: item.goal.id,
        category: item.goal.category,
        type: 'danger',
        message: `Limite de ${item.goal.category} ultrapassado em ${formatCurrency(overspent)} (${item.percentage}%)!`,
        spentAmount: item.spent,
        limitAmount: item.goal.monthlyLimit,
        percentage: item.percentage,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    } else if (item.status === 'warning') {
      const remaining = item.remaining;
      alerts.push({
        id: `alert-warning-${item.goal.id}-${month}-${year}`,
        goalId: item.goal.id,
        category: item.goal.category,
        type: 'warning',
        message: `Atenção: ${item.percentage}% da meta de ${item.goal.category} atingida. Restam ${formatCurrency(remaining)}.`,
        spentAmount: item.spent,
        limitAmount: item.goal.monthlyLimit,
        percentage: item.percentage,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }
  }

  return alerts;
}

/**
 * Calculates day-by-day cumulative expenses for a given month
 * Used for real-time trajectory comparison between months
 */
export function calculateDailyCumulativeExpense(
  transactions: Transaction[],
  month: number,
  year: number,
  daysInMonth: number = 30
): { day: number; daily: number; cumulative: number }[] {
  const monthlyExpenses = getTransactionsByMonth(transactions, month, year).filter(t => t.type === 'expense');

  const dailyMap = new Map<number, number>();
  for (const tx of monthlyExpenses) {
    const parts = tx.date.split('-');
    const day = parseInt(parts[2], 10);
    if (!isNaN(day)) {
      dailyMap.set(day, (dailyMap.get(day) || 0) + tx.amount);
    }
  }

  const result: { day: number; daily: number; cumulative: number }[] = [];
  let runningTotal = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAmount = dailyMap.get(day) || 0;
    runningTotal += dayAmount;
    result.push({
      day,
      daily: Number(dayAmount.toFixed(2)),
      cumulative: Number(runningTotal.toFixed(2)),
    });
  }

  return result;
}

/**
 * Compares two months (e.g. Current Month vs Previous Month)
 */
export function compareExpensesBetweenPeriods(
  transactions: Transaction[],
  currentMonth: number,
  currentYear: number,
  prevMonth: number,
  prevYear: number
): {
  currentTotal: number;
  prevTotal: number;
  diffAmount: number;
  percentageChange: number; // positive = increased spending (worse), negative = reduced spending (better)
  isReduced: boolean;
} {
  const currentSummary = calculateMonthlySummary(transactions, currentMonth, currentYear);
  const prevSummary = calculateMonthlySummary(transactions, prevMonth, prevYear);

  const diffAmount = currentSummary.totalExpenses - prevSummary.totalExpenses;
  const percentageChange =
    prevSummary.totalExpenses > 0
      ? ((diffAmount / prevSummary.totalExpenses) * 100)
      : 0;

  return {
    currentTotal: currentSummary.totalExpenses,
    prevTotal: prevSummary.totalExpenses,
    diffAmount: Number(diffAmount.toFixed(2)),
    percentageChange: Number(percentageChange.toFixed(1)),
    isReduced: diffAmount <= 0,
  };
}
