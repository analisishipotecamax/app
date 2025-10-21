
export interface FinancialData {
  maxMonthlyPayment: number;
  maxLoanTerm: number;
  loanTerm: number;
  maxLoanAmount: number;
  idealPurchasePrice: number;
  meetsSpecialConditions: boolean;
  meetsSpecialConditionsBase: boolean;
  idealPurchasePrice90: number;
  totalIncome: number;
  monthlyExpenses: number;
}

export interface Property {
  id: number;
  name: string;
  price: number;
  province: string;
  financingAmount: number;
  requiredFunds: number;
  monthlyPayment: number;
  debtToIncomeRatio: number;
  isFavorite?: boolean;
}

export interface FinancialInputs {
  numberOfHolders: string;
  monthlyIncome: number | '';
  annualPayments: string;
  age: number | '';
  employmentStatus: string;
  monthlyIncome2: number | '';
  annualPayments2: string;
  age2: number | '';
  employmentStatus2: string;
  monthlyExpenses: number | '';
  selectedTerm: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  userId: string;
  maxPurchasePrice: number;
  createdAt: any; // Firestore Timestamp
  status: 'default' | 'arras' | '2visita';
  sortOrder: number;
  financialInputs: FinancialInputs;
  favoriteProperty?: Property;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  defaultProvince?: string;
}

export interface ItpBonus {
  type: 'joven';
  rate: number;
  conditions: {
    maxAge?: number;
    maxPropertyPrice?: number;
    maxIncome?: number;
    maxJointIncome?: number;
  };
}

export interface ItpRate {
  general: number;
  bonuses?: ItpBonus[];
}
