import { create } from 'zustand';
import { EbasState, Loan, CreditProfile, LiquidityPool, CreateCreditProfileInput, RequestLoanInput, ProvideLiquidityInput } from '@/types';
import { useWalletStore } from './wallet';

// Configuración del contrato EBAS DeFi
const CONTRACT_ID = 'CBFQHW5DNSJGVM4YLUPPLJ4VRAZGWZZYERYCCZYKIOC2BNUCK6WHJ2CT';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

interface EbasStore extends EbasState {}

export const useEbasStore = create<EbasStore>((set, get) => ({
  loans: [],
  creditProfile: null,
  liquidityPools: [],
  totalLiquidity: '0',
  loading: false,
  error: null,

  fetchCreditProfile: async (address: string) => {
    set({ loading: true, error: null });
    
    try {
      // TODO: Implementar llamada real al contrato
      // Por ahora simulamos datos
      const mockProfile: CreditProfile = {
        user: address,
        total_income: '500000000000', // $5000
        avg_monthly_income: '40000000000', // $400
        payment_history: 750,
        gig_platforms: ['uber', 'doordash'],
        verification_level: 3,
        credit_score: 650,
        last_updated: Date.now().toString()
      };
      
      set({ 
        creditProfile: mockProfile,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching credit profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error obteniendo perfil crediticio',
        loading: false 
      });
    }
  },

  updateCreditProfile: async (data: CreateCreditProfileInput) => {
    const { publicKey, isConnected } = useWalletStore.getState();
    if (!isConnected || !publicKey) {
      throw new Error('Wallet no conectada');
    }

    set({ loading: true, error: null });

    try {
      // TODO: Implementar llamada real al contrato
      console.log('Updating credit profile:', data, 'for user:', publicKey);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calcular credit score basado en los datos
      const calculateCreditScore = (income: string, avgIncome: string, platforms: number) => {
        let score = 300;
        const avgIncomeNum = parseInt(avgIncome) / 10000000; // Convertir a USD
        
        if (avgIncomeNum > 3000) score += 200;
        else if (avgIncomeNum > 2000) score += 150;
        else if (avgIncomeNum > 1000) score += 100;
        else score += 50;
        
        score += platforms * 25;
        
        const totalIncomeNum = parseInt(income) / 10000000;
        if (totalIncomeNum > 50000) score += 100;
        else if (totalIncomeNum > 25000) score += 50;
        
        return Math.min(score, 850);
      };

      const newProfile: CreditProfile = {
        user: publicKey,
        total_income: data.total_income,
        avg_monthly_income: data.avg_monthly_income,
        payment_history: 500, // Valor inicial
        gig_platforms: data.gig_platforms,
        verification_level: 3, // Nivel inicial
        credit_score: calculateCreditScore(data.total_income, data.avg_monthly_income, data.gig_platforms.length),
        last_updated: Date.now().toString()
      };

      set({ 
        creditProfile: newProfile,
        loading: false 
      });

    } catch (error) {
      console.error('Error updating credit profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error actualizando perfil crediticio',
        loading: false 
      });
      throw error;
    }
  },

  requestLoan: async (data: RequestLoanInput) => {
    const { publicKey, isConnected } = useWalletStore.getState();
    if (!isConnected || !publicKey) {
      throw new Error('Wallet no conectada');
    }

    set({ loading: true, error: null });

    try {
      // TODO: Implementar llamada real al contrato
      console.log('Requesting loan:', data, 'for user:', publicKey);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const loanId = Date.now(); // ID temporal
      const newLoan: Loan = {
        borrower: publicKey,
        amount: data.amount,
        collateral: data.collateral,
        interest_rate: 1500, // 15% por defecto
        duration: data.duration.toString(),
        created_at: Date.now().toString(),
        due_date: (Date.now() + data.duration * 1000).toString(),
        is_active: true,
        credit_score: get().creditProfile?.credit_score || 600
      };

      const currentLoans = get().loans;
      set({ 
        loans: [...currentLoans, newLoan],
        loading: false 
      });

      return loanId;

    } catch (error) {
      console.error('Error requesting loan:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error solicitando préstamo',
        loading: false 
      });
      throw error;
    }
  },

  provideLiquidity: async (data: ProvideLiquidityInput) => {
    const { publicKey, isConnected } = useWalletStore.getState();
    if (!isConnected || !publicKey) {
      throw new Error('Wallet no conectada');
    }

    set({ loading: true, error: null });

    try {
      // TODO: Implementar llamada real al contrato
      console.log('Providing liquidity:', data, 'for user:', publicKey);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPool: LiquidityPool = {
        provider: publicKey,
        amount: data.amount,
        apy: 800, // 8% APY
        provided_at: Date.now().toString(),
        earned_interest: '0',
        is_active: true
      };

      const currentPools = get().liquidityPools;
      const currentTotal = get().totalLiquidity;
      const newTotal = (BigInt(currentTotal) + BigInt(data.amount)).toString();

      set({ 
        liquidityPools: [...currentPools, newPool],
        totalLiquidity: newTotal,
        loading: false 
      });

    } catch (error) {
      console.error('Error providing liquidity:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error proporcionando liquidez',
        loading: false 
      });
      throw error;
    }
  },

  getLoan: async (loanId: number) => {
    try {
      // TODO: Implementar llamada real al contrato
      const loans = get().loans;
      return loans.find(loan => parseInt(loan.created_at) === loanId) || null;
    } catch (error) {
      console.error('Error getting loan:', error);
      return null;
    }
  },

  getTotalLiquidity: async () => {
    set({ loading: true, error: null });
    
    try {
      // TODO: Implementar llamada real al contrato
      // Por ahora usamos el valor del store
      set({ loading: false });
    } catch (error) {
      console.error('Error getting total liquidity:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error obteniendo liquidez total',
        loading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));