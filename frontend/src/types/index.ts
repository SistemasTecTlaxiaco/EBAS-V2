// Interfaces para EBAS DeFi
export interface Loan {
  borrower: string;
  amount: string;
  collateral: string;
  interest_rate: number;
  duration: string;
  created_at: string;
  due_date: string;
  is_active: boolean;
  credit_score: number;
}

export interface CreditProfile {
  user: string;
  total_income: string;
  avg_monthly_income: string;
  payment_history: number;
  gig_platforms: string[];
  verification_level: number;
  credit_score: number;
  last_updated: string;
}

export interface LiquidityPool {
  provider: string;
  amount: string;
  apy: number;
  provided_at: string;
  earned_interest: string;
  is_active: boolean;
}

// Inputs para las funciones del contrato
export interface CreateCreditProfileInput {
  total_income: string;
  avg_monthly_income: string;
  gig_platforms: string[];
}

export interface RequestLoanInput {
  amount: string;
  collateral: string;
  duration: number; // en segundos
}

export interface ProvideLiquidityInput {
  amount: string;
}

// Freighter API types
export interface FreighterApi {
  isConnected(): Promise<boolean>;
  getPublicKey(): Promise<string>;
  signTransaction(
    transaction: string,
    opts?: {
      networkPassphrase?: string;
      accountToSign?: string;
    }
  ): Promise<string>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

// Wallet state interface
export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// EBAS DeFi state interfaces
export interface EbasState {
  loans: Loan[];
  creditProfile: CreditProfile | null;
  liquidityPools: LiquidityPool[];
  totalLiquidity: string;
  loading: boolean;
  error: string | null;
  fetchCreditProfile: (address: string) => Promise<void>;
  updateCreditProfile: (data: CreateCreditProfileInput) => Promise<void>;
  requestLoan: (data: RequestLoanInput) => Promise<number>;
  provideLiquidity: (data: ProvideLiquidityInput) => Promise<void>;
  getLoan: (loanId: number) => Promise<Loan | null>;
  getTotalLiquidity: () => Promise<void>;
  clearError: () => void;
}