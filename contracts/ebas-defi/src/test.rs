#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, vec, Env};

fn create_test_contract(env: &Env) -> (Address, EbasDeFiContractClient<'_>) {
    let admin = Address::generate(env);
    let contract_address = env.register(EbasDeFiContract, ());
    let client = EbasDeFiContractClient::new(env, &contract_address);
    client.initialize(&admin);
    (admin, client)
}

#[test]
fn test_initialize_contract() {
    let env = Env::default();
    let (_admin, client) = create_test_contract(&env);
    
    // Verificar que la liquidez inicial es 0
    assert_eq!(client.get_total_liquidity(), 0);
}

#[test]
fn test_credit_profile_creation() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_admin, client) = create_test_contract(&env);
    let user = Address::generate(&env);
    
    let platforms = vec![
        &env,
        String::from_str(&env, "uber"),
        String::from_str(&env, "doordash"),
    ];
    
    // Crear perfil crediticio
    client.update_credit_profile(
        &user,
        &50000_0000000i128, // $50k ingresos totales
        &4000_0000000i128,  // $4k promedio mensual
        &platforms,
    );
    
    // Verificar que el perfil se creó correctamente
    let profile = client.get_credit_profile(&user).unwrap();
    assert_eq!(profile.total_income, 50000_0000000i128);
    assert_eq!(profile.avg_monthly_income, 4000_0000000i128);
    assert!(profile.credit_score > 300); // Debería tener un score decente
    assert!(profile.credit_score <= 850);
}

#[test]
fn test_provide_liquidity() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_admin, client) = create_test_contract(&env);
    let provider = Address::generate(&env);
    
    // Proporcionar liquidez
    client.provide_liquidity(&provider, &10000_0000000i128); // $10k
    
    // Verificar que la liquidez se agregó
    assert_eq!(client.get_total_liquidity(), 10000_0000000i128);
}

#[test]
fn test_request_loan() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });
    
    let (_admin, client) = create_test_contract(&env);
    let provider = Address::generate(&env);
    let borrower = Address::generate(&env);
    
    // Primero proporcionar liquidez
    client.provide_liquidity(&provider, &10000_0000000i128);
    
    // Crear perfil crediticio para el borrower
    let platforms = vec![&env, String::from_str(&env, "uber")];
    client.update_credit_profile(
        &borrower,
        &25000_0000000i128, // $25k ingresos
        &2000_0000000i128,  // $2k mensual
        &platforms,
    );
    
    // Solicitar préstamo
    let loan_amount = 1000_0000000i128; // $1k
    let collateral = 1500_0000000i128;  // $1.5k (150%)
    let duration = 86400u64; // 1 día
    
    let loan_id = client.request_loan(&borrower, &loan_amount, &collateral, &duration);
    
    // Verificar que el préstamo se creó
    let loan = client.get_loan(&loan_id).unwrap();
    assert_eq!(loan.borrower, borrower);
    assert_eq!(loan.amount, loan_amount);
    assert_eq!(loan.collateral, collateral);
    assert!(loan.is_active);
    
    // Verificar que la liquidez se redujo
    assert_eq!(client.get_total_liquidity(), 9000_0000000i128);
}

#[test]
#[should_panic(expected = "Colateral insuficiente")]
fn test_insufficient_collateral() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_admin, client) = create_test_contract(&env);
    let provider = Address::generate(&env);
    let borrower = Address::generate(&env);
    
    // Proporcionar liquidez
    client.provide_liquidity(&provider, &10000_0000000i128);
    
    // Crear perfil crediticio
    let platforms = vec![&env, String::from_str(&env, "uber")];
    client.update_credit_profile(
        &borrower,
        &25000_0000000i128,
        &2000_0000000i128,
        &platforms,
    );
    
    // Intentar préstamo con colateral insuficiente
    let loan_amount = 1000_0000000i128; // $1k
    let insufficient_collateral = 1000_0000000i128; // $1k (100%, necesita 150%)
    let duration = 86400u64;
    
    // Esto debería fallar con panic
    client.request_loan(&borrower, &loan_amount, &insufficient_collateral, &duration);
}

#[test]
fn test_credit_score_calculation() {
    let env = Env::default();
    env.mock_all_auths();
    
    let (_admin, client) = create_test_contract(&env);
    let user_high = Address::generate(&env);
    let user_low = Address::generate(&env);
    
    // Usuario con ingresos altos y múltiples plataformas
    let platforms_high = vec![
        &env,
        String::from_str(&env, "uber"),
        String::from_str(&env, "doordash"),
        String::from_str(&env, "lyft"),
    ];
    
    client.update_credit_profile(
        &user_high,
        &60000_0000000i128, // $60k total
        &5000_0000000i128,  // $5k mensual
        &platforms_high,
    );
    
    // Usuario con ingresos bajos y una plataforma
    let platforms_low = vec![&env, String::from_str(&env, "uber")];
    
    client.update_credit_profile(
        &user_low,
        &15000_0000000i128, // $15k total
        &1250_0000000i128,  // $1.25k mensual
        &platforms_low,
    );
    
    // Verificar que el score alto es mayor que el bajo
    let profile_high = client.get_credit_profile(&user_high).unwrap();
    let profile_low = client.get_credit_profile(&user_low).unwrap();
    
    assert!(profile_high.credit_score > profile_low.credit_score);
    assert!(profile_high.credit_score >= 600); // Debería ser un buen score
    assert!(profile_low.credit_score <= 500);  // Score más bajo
}