export type TransactionType = 'expense' | 'income';

export type TransactionCategory =
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Assinaturas'
  | 'Compras'
  | 'Salário'
  | 'Investimentos'
  | 'Freelance'
  | 'Renda Extra'
  | 'Aluguel'
  | 'Outros';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit' | 'boleto' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  description: string;
  amount: number; // positive value in BRL
  type: TransactionType;
  category: TransactionCategory;
  accountId: string; // references BankAccount or CreditCard
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending';
  notes?: string;
  tags?: string[];
}

export type BankInstitution =
  | 'Nubank'
  | 'Itaú'
  | 'Bradesco'
  | 'Banco Inter'
  | 'Santander'
  | 'C6 Bank'
  | 'BTG Pactual'
  | 'Banco do Brasil'
  | 'Caixa Econômica';

export interface BankAccount {
  id: string;
  name: string;
  institution: BankInstitution;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  accountNumberMasked: string;
  color: string;
  lastSyncTime: string;
  isConnected: boolean;
  status: 'active' | 'syncing' | 'error';
}

export interface CreditCard {
  id: string;
  name: string;
  institution: BankInstitution;
  brand: 'Mastercard' | 'Visa' | 'Elo';
  limit: number;
  currentInvoice: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  lastFourDigits: string;
  color: string;
  isConnected: boolean;
  lastSyncTime: string;
}

export interface BudgetGoal {
  id: string;
  category: TransactionCategory;
  monthlyLimit: number;
  alertThreshold: number; // percentage (e.g., 80)
  period: 'monthly';
  isCustom?: boolean;
}

export interface BudgetAlert {
  id: string;
  goalId: string;
  category: TransactionCategory;
  type: 'warning' | 'danger';
  message: string;
  spentAmount: number;
  limitAmount: number;
  percentage: number;
  timestamp: string;
  isRead: boolean;
}

export interface MonthlySummary {
  month: number; // 1-12
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  creditCardTotal: number;
}

export interface CategoryExpense {
  category: TransactionCategory;
  total: number;
  percentage: number;
  count: number;
  budgetLimit?: number;
  color: string;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  isLocked: boolean;
  privacyMode: boolean; // hide sensitive amounts
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastAuditDate: string;
  openFinanceConsentValidUntil: string;
  encryptionStandard: string;
}
