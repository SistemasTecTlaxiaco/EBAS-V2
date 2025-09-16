#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, Vec, String};

/// Estructura principal del préstamo
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    pub borrower: Address,
    pub amount: i128,
    pub collateral: i128,
    pub interest_rate: u32,  // Tasa de interés en puntos básicos (1% = 100)
    pub duration: u64,       // Duración en segundos
    pub created_at: u64,
    pub due_date: u64,
    pub is_active: bool,
    pub credit_score: u32,
}

/// Estructura del perfil de crédito del usuario
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CreditProfile {
    pub user: Address,
    pub total_income: i128,      // Ingresos totales reportados
    pub avg_monthly_income: i128, // Promedio mensual
    pub payment_history: u32,    // Score de historial (0-1000)
    pub gig_platforms: Vec<String>, // Plataformas donde trabaja
    pub verification_level: u32, // Nivel de verificación (0-5)
    pub credit_score: u32,       // Score final (300-850)
    pub last_updated: u64,
}

/// Pool de liquidez para prestamistas
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LiquidityPool {
    pub provider: Address,
    pub amount: i128,
    pub apy: u32,            // APY en puntos básicos
    pub provided_at: u64,
    pub earned_interest: i128,
    pub is_active: bool,
}

/// Estados de datos para el contrato
#[contracttype]
pub enum DataKey {
    Loans,              // Map<u64, Loan>
    CreditProfiles,     // Map<Address, CreditProfile>
    LiquidityPools,     // Map<Address, Vec<LiquidityPool>>
    LoanCounter,        // u64
    TotalLiquidity,     // i128
    Admin,              // Address
    Paused,             // bool
    InterestRates,      // Map<u32, u32> - credit_score -> interest_rate
}

#[contract]
pub struct EbasDeFiContract;

#[contractimpl]
impl EbasDeFiContract {
    /// Inicializar el contrato con el administrador
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::LoanCounter, &0u64);
        env.storage().instance().set(&DataKey::TotalLiquidity, &0i128);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        // Configurar tasas de interés base según credit score
        let mut rates = Map::new(&env);
        rates.set(300, 2500); // Score bajo: 25% APY
        rates.set(400, 2000); // Score medio-bajo: 20% APY  
        rates.set(500, 1500); // Score medio: 15% APY
        rates.set(600, 1200); // Score medio-alto: 12% APY
        rates.set(700, 1000); // Score alto: 10% APY
        rates.set(800, 800);  // Score muy alto: 8% APY
        env.storage().instance().set(&DataKey::InterestRates, &rates);
    }

    /// Crear o actualizar perfil crediticio del usuario
    pub fn update_credit_profile(
        env: Env,
        user: Address,
        total_income: i128,
        avg_monthly_income: i128,
        gig_platforms: Vec<String>,
    ) {
        user.require_auth();

        let mut profiles: Map<Address, CreditProfile> = env
            .storage()
            .persistent()
            .get(&DataKey::CreditProfiles)
            .unwrap_or(Map::new(&env));

        // Calcular credit score basado en ingresos y verificación
        let credit_score = Self::calculate_credit_score(
            &env,
            total_income,
            avg_monthly_income,
            gig_platforms.len() as u32,
        );

        let profile = CreditProfile {
            user: user.clone(),
            total_income,
            avg_monthly_income,
            payment_history: 500, // Valor inicial
            gig_platforms,
            verification_level: 3, // Nivel inicial
            credit_score,
            last_updated: env.ledger().timestamp(),
        };

        profiles.set(user, profile);
        env.storage()
            .persistent()
            .set(&DataKey::CreditProfiles, &profiles);
    }

    /// Solicitar un préstamo
    pub fn request_loan(
        env: Env,
        borrower: Address,
        amount: i128,
        collateral: i128,
        duration: u64,
    ) -> u64 {
        borrower.require_auth();
        Self::require_not_paused(&env);

        // Verificar que hay liquidez suficiente
        let total_liquidity: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLiquidity)
            .unwrap_or(0);
        
        assert!(total_liquidity >= amount, "Liquidez insuficiente");

        // Obtener perfil crediticio
        let profiles: Map<Address, CreditProfile> = env
            .storage()
            .persistent()
            .get(&DataKey::CreditProfiles)
            .unwrap_or(Map::new(&env));
        
        let profile = profiles.get(borrower.clone()).unwrap_or_else(|| {
            panic!("Perfil crediticio no encontrado")
        });

        // Calcular tasa de interés basada en credit score
        let interest_rate = Self::get_interest_rate(&env, profile.credit_score);

        // Verificar ratio de colateral (mínimo 150%)
        assert!(collateral >= (amount * 150) / 100, "Colateral insuficiente");

        // Crear préstamo
        let loan_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::LoanCounter)
            .unwrap_or(0);

        let loan = Loan {
            borrower: borrower.clone(),
            amount,
            collateral,
            interest_rate,
            duration,
            created_at: env.ledger().timestamp(),
            due_date: env.ledger().timestamp() + duration,
            is_active: true,
            credit_score: profile.credit_score,
        };

        // Guardar préstamo
        let mut loans: Map<u64, Loan> = env
            .storage()
            .persistent()
            .get(&DataKey::Loans)
            .unwrap_or(Map::new(&env));
        
        loans.set(loan_id, loan);
        env.storage().persistent().set(&DataKey::Loans, &loans);

        // Actualizar contador y liquidez
        env.storage()
            .instance()
            .set(&DataKey::LoanCounter, &(loan_id + 1));
        
        env.storage()
            .instance()
            .set(&DataKey::TotalLiquidity, &(total_liquidity - amount));

        loan_id
    }

    /// Proporcionar liquidez al pool
    pub fn provide_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        Self::require_not_paused(&env);

        let mut pools: Map<Address, Vec<LiquidityPool>> = env
            .storage()
            .persistent()
            .get(&DataKey::LiquidityPools)
            .unwrap_or(Map::new(&env));

        let pool = LiquidityPool {
            provider: provider.clone(),
            amount,
            apy: 800, // 8% APY base para proveedores
            provided_at: env.ledger().timestamp(),
            earned_interest: 0,
            is_active: true,
        };

        let mut provider_pools = pools.get(provider.clone()).unwrap_or(Vec::new(&env));
        provider_pools.push_back(pool);
        pools.set(provider, provider_pools);

        env.storage()
            .persistent()
            .set(&DataKey::LiquidityPools, &pools);

        // Actualizar liquidez total
        let total_liquidity: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLiquidity)
            .unwrap_or(0);
        
        env.storage()
            .instance()
            .set(&DataKey::TotalLiquidity, &(total_liquidity + amount));
    }

    /// Funciones auxiliares privadas
    fn calculate_credit_score(
        _env: &Env,
        total_income: i128,
        avg_monthly_income: i128,
        platforms_count: u32,
    ) -> u32 {
        let mut score = 300u32; // Score mínimo
        
        // Bonus por ingresos mensuales
        if avg_monthly_income > 3000_0000000 { score += 200; } // >$3000
        else if avg_monthly_income > 2000_0000000 { score += 150; } // >$2000
        else if avg_monthly_income > 1000_0000000 { score += 100; } // >$1000
        else { score += 50; }

        // Bonus por diversificación de plataformas
        score += platforms_count * 25; // +25 por plataforma

        // Bonus por ingresos totales
        if total_income > 50000_0000000 { score += 100; } // >$50k total
        else if total_income > 25000_0000000 { score += 50; } // >$25k total

        score.min(850) // Score máximo
    }

    fn get_interest_rate(env: &Env, credit_score: u32) -> u32 {
        let rates: Map<u32, u32> = env
            .storage()
            .instance()
            .get(&DataKey::InterestRates)
            .unwrap_or(Map::new(env));

        // Encontrar la tasa apropiada basada en score
        if credit_score >= 800 { 
            rates.get(800).unwrap_or(800) // 8% default
        }
        else if credit_score >= 700 { 
            rates.get(700).unwrap_or(1000) // 10% default
        }
        else if credit_score >= 600 { 
            rates.get(600).unwrap_or(1200) // 12% default
        }
        else if credit_score >= 500 { 
            rates.get(500).unwrap_or(1500) // 15% default
        }
        else if credit_score >= 400 { 
            rates.get(400).unwrap_or(2000) // 20% default
        }
        else { 
            rates.get(300).unwrap_or(2500) // 25% default
        }
    }

    fn require_not_paused(env: &Env) {
        let paused: bool = env
            .storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false);
        assert!(!paused, "Contrato pausado");
    }

    /// Funciones de lectura (queries)
    pub fn get_loan(env: Env, loan_id: u64) -> Option<Loan> {
        let loans: Map<u64, Loan> = env
            .storage()
            .persistent()
            .get(&DataKey::Loans)
            .unwrap_or(Map::new(&env));
        loans.get(loan_id)
    }

    pub fn get_credit_profile(env: Env, user: Address) -> Option<CreditProfile> {
        let profiles: Map<Address, CreditProfile> = env
            .storage()
            .persistent()
            .get(&DataKey::CreditProfiles)
            .unwrap_or(Map::new(&env));
        profiles.get(user)
    }

    pub fn get_total_liquidity(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalLiquidity)
            .unwrap_or(0)
    }
}

mod test;