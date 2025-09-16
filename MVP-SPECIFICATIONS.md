# 🚀 MVP Lana - Plataforma de Préstamos DeFi en Stellar/Soroban

## 📋 Especificaciones Técnicas del Proyecto

**Fecha:** 15 de Septiembre, 2025  
**Stakeholder:** Propietario del Producto  
**Tecnologías:** Next.js 15, Node.js, Stellar SDK, Soroban Smart Contracts  

---

## 🎯 Visión del Producto

Desarrollar una plataforma DeFi que otorgue préstamos instantáneos basados en el historial de ingresos de aplicaciones gig economy (Uber, Rappi, etc.), utilizando la blockchain Stellar y contratos inteligentes Soroban para automatizar el desembolso.

---

## 🏗️ FASE 1: DESARROLLO DEL FRONTEND

### 📝 Especificaciones del Frontend (Next.js 15)

**Objetivo:** Crear una experiencia de usuario intuitiva que guíe al usuario desde la conexión de wallet hasta el desembolso del préstamo.

#### 🎨 Componentes Requeridos

**1. Landing Page (`/`)**
```typescript
// Componente: LandingPage
// Ubicación: src/app/page.tsx
```
- **Diseño:** Landing minimalista con branding "Lana"
- **CTA Principal:** Botón prominente "Conectar Wallet"
- **Elementos:** Hero section, value proposition, testimonios simulados
- **Responsive:** Mobile-first design con Tailwind CSS
- **Animaciones:** Framer Motion para microinteracciones

**2. Conexión de Wallet (`/connect`)**
```typescript
// Componente: WalletConnection
// Ubicación: src/components/WalletConnection.tsx
```
- **Proveedores Soportados:**
  - Freighter (extensión oficial Stellar)
  - Albedo (wallet web)
  - LOBSTR (móvil/extensión)
- **Funcionalidades:**
  - Detección automática de wallets instalados
  - Manejo de errores de conexión
  - Validación de red (Testnet/Mainnet)
  - Persistencia de sesión

**3. Dashboard de Ingresos (`/dashboard`)**
```typescript
// Componente: IncomeDashboard
// Ubicación: src/app/dashboard/page.tsx
```
- **Estados de UI:**
  - **Inicial:** Botón "Conecta tus Apps y Genera tu Historial"
  - **Procesando:** Spinner con mensaje "Analizando historial..."
  - **Completado:** Vista del perfil crediticio
- **Elementos:**
  - Cards de aplicaciones conectadas
  - Progress bar del análisis
  - Resumen de ingresos (gráficos Chart.js)

**4. Perfil Crediticio (`/profile`)**
```typescript
// Componente: CreditProfile
// Ubicación: src/components/CreditProfile.tsx
```
- **Información Mostrada:**
  - Estado de elegibilidad (Aprobado/Rechazado)
  - Monto del préstamo disponible
  - Términos y condiciones
  - **Nota:** Credit Score NO visible al cliente
- **Interacciones:**
  - Botón "Solicitar Préstamo" (solo si elegible)
  - Modal de confirmación con términos

**5. Notificación de Desembolso (`/success`)**
```typescript
// Componente: LoanSuccess
// Ubicación: src/app/success/page.tsx
```
- **Elementos:**
  - Confirmación de aprobación
  - Transaction Hash de Stellar
  - Monto transferido
  - Botón "Ver en Wallet"
  - Botón "Ver en Stellar Explorer"

#### 🔗 Integraciones Técnicas

**Stellar SDK Integration:**
```typescript
// src/lib/stellar.ts
import * as StellarSdk from '@stellar/stellar-sdk';

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  private network: string;
  
  // Métodos requeridos:
  // - connectWallet()
  // - getAccountInfo()
  // - signTransaction()
  // - submitTransaction()
}
```

**API Client:**
```typescript
// src/lib/api.ts
export class LoanAPI {
  // POST /api/get-loan-data
  // POST /api/process-loan
  // GET /api/loan-status/:id
}
```

#### 📱 Diseño UX/UI

**Design System:**
- **Colores:** Paleta moderna con gradientes (azul/violeta)
- **Tipografía:** Inter font family
- **Componentes:** Shadcn/ui como base
- **Iconografía:** Lucide React icons
- **Estados:** Loading skeletons, error boundaries
- **Responsividad:** Breakpoints: mobile (320px), tablet (768px), desktop (1024px)

---

## ⚙️ FASE 2: DESARROLLO DEL BACKEND

### 📝 Especificaciones del Backend (Node.js/Express)

**Objetivo:** API REST que simule la integración con plataformas gig economy y gestione la lógica de credit scoring.

#### 🛠️ Arquitectura Técnica

**Stack Tecnológico:**
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "SQLite (desarrollo) / PostgreSQL (producción)",
  "orm": "Prisma",
  "validation": "Zod",
  "testing": "Jest",
  "stellar": "@stellar/stellar-sdk"
}
```

#### 🔌 Endpoints Requeridos

**1. Mock Data Endpoint**
```javascript
// POST /api/get-loan-data
// Body: { walletAddress: string, platforms: string[] }
// Response: LoanDataResponse
```

**Datos Mock Simulados:**
```typescript
interface LoanDataResponse {
  user: {
    walletAddress: string;
    platforms: PlatformData[];
    totalEarnings: number;
    weeklyAverage: number;
    creditScore: number; // Interno, no enviado al frontend
    eligibility: 'approved' | 'rejected';
    loanAmount?: number;
  }
}

interface PlatformData {
  platform: 'uber' | 'rappi' | 'didi' | 'deliveroo';
  earnings: WeeklyEarning[];
  rating: number;
  tripsCount: number;
}

interface WeeklyEarning {
  week: string; // ISO format
  amount: number;
  currency: 'USD';
  trips: number;
}
```

**Datos Predefinidos (3-4 semanas):**
```javascript
const MOCK_USERS = {
  'GXXXXXXXXXXXXXXX': { // Wallet address
    platforms: [
      {
        platform: 'uber',
        earnings: [
          { week: '2025-08-19', amount: 450, currency: 'USD', trips: 32 },
          { week: '2025-08-26', amount: 520, currency: 'USD', trips: 38 },
          { week: '2025-09-02', amount: 380, currency: 'USD', trips: 28 },
          { week: '2025-09-09', amount: 490, currency: 'USD', trips: 35 }
        ],
        rating: 4.8,
        tripsCount: 133
      }
      // Más plataformas...
    ]
  }
};
```

**2. Credit Scoring Engine**
```javascript
// src/services/creditScoring.js
class CreditScoringEngine {
  calculateScore(userData) {
    const weeklyAverage = this.getWeeklyAverage(userData.platforms);
    const consistency = this.getConsistencyScore(userData.platforms);
    const platformDiversity = userData.platforms.length;
    
    // Lógica simple MVP:
    if (weeklyAverage >= 400 && consistency >= 0.7) {
      return {
        score: 750,
        eligibility: 'approved',
        loanAmount: Math.min(weeklyAverage * 0.5, 500) // 50% del ingreso promedio, max $500
      };
    }
    
    return {
      score: 550,
      eligibility: 'rejected',
      loanAmount: 0
    };
  }
}
```

**3. Soroban Integration**
```javascript
// POST /api/process-loan
// Body: { walletAddress: string, loanAmount: number }
```

**Stellar/Soroban Client:**
```javascript
// src/services/stellarClient.js
const StellarSdk = require('@stellar/stellar-sdk');

class StellarLoanService {
  constructor() {
    this.server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    this.contractId = process.env.LOAN_CONTRACT_ID;
    this.sourceKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
  }

  async processLoan(recipientAddress, creditScore, loanAmount) {
    try {
      // 1. Construir transacción para llamar al contrato
      const account = await this.server.loadAccount(this.sourceKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(
        StellarSdk.Operation.invokeContract({
          contract: this.contractId,
          function: 'transfer_loan',
          args: [
            StellarSdk.nativeToScVal(recipientAddress, { type: 'address' }),
            StellarSdk.nativeToScVal(creditScore, { type: 'u32' }),
            StellarSdk.nativeToScVal(loanAmount * 10000000, { type: 'i128' }), // 7 decimals
          ],
        })
      )
      .setTimeout(30)
      .build();

      // 2. Firmar y enviar transacción
      transaction.sign(this.sourceKeypair);
      const result = await this.server.submitTransaction(transaction);
      
      return {
        success: true,
        transactionHash: result.hash,
        loanAmount,
        recipientAddress
      };
    } catch (error) {
      throw new Error(`Loan processing failed: ${error.message}`);
    }
  }
}
```

#### 🛡️ Seguridad y Validación

**Variables de Entorno:**
```env
# .env
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
LOAN_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_NETWORK=testnet
JWT_SECRET=your-jwt-secret
```

**Middleware de Validación:**
```javascript
// src/middleware/validation.js
const { z } = require('zod');

const loanRequestSchema = z.object({
  walletAddress: z.string().regex(/^G[0-9A-Z]{55}$/, 'Invalid Stellar address'),
  platforms: z.array(z.enum(['uber', 'rappi', 'didi', 'deliveroo'])).min(1)
});
```

---

## 🔐 FASE 3: CONTRATO INTELIGENTE SOROBAN

### 📝 Especificaciones del Smart Contract

**Objetivo:** Contrato que automatice la aprobación y desembolso de préstamos basado en credit score.

#### 🦀 Implementación en Rust

**Estructura del Contrato:**
```rust
// contracts/loan-contract/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, token, Symbol};

#[contract]
pub struct LoanContract;

const USDC_TOKEN: Address = address!("CBIELTBMWMZQW4ZRE4HVBHDCL2MZGGQB4BOR7AE7IQVUNYBWNDTYXBQK"); // Testnet USDC

#[contractimpl]
impl LoanContract {
    // Función principal del MVP
    pub fn transfer_loan(
        env: Env,
        borrower: Address,
        credit_score: u32,
        loan_amount: i128,
    ) -> Result<(), LoanError> {
        // 1. Validar credit score mínimo
        let min_score: u32 = 700;
        if credit_score < min_score {
            return Err(LoanError::InsufficientCreditScore);
        }

        // 2. Validar monto máximo
        let max_loan: i128 = 500_0000000; // $500 USDC (7 decimals)
        if loan_amount > max_loan {
            return Err(LoanError::ExcessiveLoanAmount);
        }

        // 3. Verificar fondos del contrato
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &USDC_TOKEN);
        let available_balance = token_client.balance(&contract_address);
        
        if available_balance < loan_amount {
            return Err(LoanError::InsufficientFunds);
        }

        // 4. Ejecutar transferencia automática
        token_client.transfer(&contract_address, &borrower, &loan_amount);

        // 5. Emitir evento
        env.events().publish(
            (Symbol::new(&env, "loan_disbursed"),),
            (borrower.clone(), credit_score, loan_amount)
        );

        Ok(())
    }

    // Función auxiliar para fondear el contrato
    pub fn fund_contract(env: Env, funder: Address, amount: i128) {
        funder.require_auth();
        
        let token_client = token::Client::new(&env, &USDC_TOKEN);
        let contract_address = env.current_contract_address();
        
        token_client.transfer(&funder, &contract_address, &amount);
    }
}

#[derive(Debug, Eq, PartialEq)]
pub enum LoanError {
    InsufficientCreditScore = 1,
    ExcessiveLoanAmount = 2,
    InsufficientFunds = 3,
}
```

**Tests del Contrato:**
```rust
// contracts/loan-contract/src/test.rs
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_successful_loan_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let borrower = Address::generate(&env);
        let credit_score = 750u32;
        let loan_amount = 100_0000000i128; // $100

        // Test successful transfer
        let result = client.transfer_loan(&borrower, &credit_score, &loan_amount);
        assert!(result.is_ok());
    }

    #[test]
    fn test_insufficient_credit_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let borrower = Address::generate(&env);
        let credit_score = 650u32; // Below minimum
        let loan_amount = 100_0000000i128;

        let result = client.transfer_loan(&borrower, &credit_score, &loan_amount);
        assert_eq!(result.unwrap_err(), LoanError::InsufficientCreditScore);
    }
}
```

---

## 📊 MÉTRICAS DE UI/UX PROFESIONALES

### 🎯 Core Web Vitals & Performance

**Métricas de Rendimiento (Objetivo: >90 Google PageSpeed):**
```typescript
// Implementar en src/lib/analytics.ts
interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint < 2.5s
  FID: number; // First Input Delay < 100ms
  CLS: number; // Cumulative Layout Shift < 0.1
  
  // Métricas Adicionales
  TTFB: number; // Time to First Byte < 600ms
  FCP: number;  // First Contentful Paint < 1.8s
  TTI: number;  // Time to Interactive < 3.8s
}
```

**Targets de Rendimiento:**
- **LCP (Largest Contentful Paint):** < 2.5 segundos
- **FID (First Input Delay):** < 100 milisegundos
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600 milisegundos
- **Bundle Size:** < 250KB gzipped
- **Lighthouse Score:** > 90 en todas las categorías

### 🔄 Métricas de Conversión y Funnel

**Funnel de Conversión:**
```typescript
interface ConversionMetrics {
  // Etapas del funnel principal
  landingPageViews: number;
  walletConnectionAttempts: number;
  walletConnectionSuccess: number;
  dashboardViews: number;
  appsConnectionClicks: number;
  creditScoreGenerated: number;
  loanRequests: number;
  loanApprovals: number;
  successfulDisbursements: number;
  
  // Ratios de conversión
  walletConnectionRate: number; // Target: >75%
  creditGenerationRate: number; // Target: >90%
  loanRequestRate: number;      // Target: >60%
  disbursementSuccessRate: number; // Target: >95%
}
```

**KPIs de Conversión Específicos:**
- **Landing → Wallet Connection:** > 75%
- **Wallet Connected → Apps Connected:** > 85%
- **Apps Connected → Credit Generated:** > 90%
- **Credit Generated → Loan Request:** > 60%
- **Loan Request → Successful Disbursement:** > 95%
- **Overall Conversion (Landing → Loan):** > 35%

### 👤 Métricas de Experiencia de Usuario

**Usabilidad y Satisfacción:**
```typescript
interface UserExperienceMetrics {
  // Tiempo en cada etapa
  avgTimeOnLanding: number;      // Target: 30-45s
  avgWalletConnectionTime: number; // Target: <20s
  avgAppsConnectionTime: number;   // Target: <15s
  avgCreditProcessingTime: number; // Target: <10s
  avgLoanRequestTime: number;      // Target: <30s
  
  // Tasas de abandono por etapa
  landingBounceRate: number;     // Target: <40%
  walletConnectionDropoff: number; // Target: <25%
  appsConnectionDropoff: number;   // Target: <15%
  loanRequestDropoff: number;      // Target: <10%
  
  // Métricas de satisfacción
  userSatisfactionScore: number;   // Target: >4.2/5
  netPromoterScore: number;        // Target: >50
  taskSuccessRate: number;         // Target: >90%
}
```

### 📱 Métricas de Accesibilidad y Responsividad

**Accessibility & Mobile UX:**
```typescript
interface AccessibilityMetrics {
  // Lighthouse Accessibility
  accessibilityScore: number;    // Target: >95
  
  // WCAG Compliance
  contrastRatio: number;         // Target: >4.5:1
  keyboardNavigation: boolean;   // Target: 100%
  screenReaderCompatibility: number; // Target: >95%
  altTextCoverage: number;       // Target: 100%
  
  // Mobile Experience
  mobileConversionRate: number;  // Target: >70% of desktop
  mobileLoadTime: number;        // Target: <3s
  touchTargetSize: number;       // Target: >44px
  viewportAdaptability: number;  // Target: 100%
}
```

### 🛡️ Métricas de Seguridad y Confianza

**Trust & Security UX:**
```typescript
interface TrustMetrics {
  // Indicadores de confianza
  securityBadgeVisibility: number;    // Target: 100%
  privacyPolicyReadRate: number;      // Target: >25%
  termsAcceptanceTime: number;        // Target: <60s
  
  // Transparencia del proceso
  processStepClarityScore: number;    // Target: >4.5/5
  progressIndicatorEffectiveness: number; // Target: >90%
  errorMessageHelpfulness: number;    // Target: >4/5
  
  // Wallet Security UX
  walletConnectionConfidence: number; // Target: >4.5/5
  transactionTransparency: number;    // Target: >95%
}
```

### 📊 Dashboard de Métricas Real-time

**Implementación de Analytics:**
```typescript
// src/lib/analytics.ts
export class AnalyticsDashboard {
  private analytics: Analytics;
  
  // Tracking de eventos críticos
  trackWalletConnection(provider: string, success: boolean, duration: number) {
    this.analytics.track('wallet_connection', {
      provider,
      success,
      duration,
      timestamp: Date.now()
    });
  }
  
  trackAppsConnection(platforms: string[], success: boolean, duration: number) {
    this.analytics.track('apps_connection', {
      platforms,
      platform_count: platforms.length,
      success,
      duration
    });
  }
  
  trackCreditScoreGeneration(score: number, eligibility: boolean, duration: number) {
    this.analytics.track('credit_score_generated', {
      score_range: this.getScoreRange(score),
      eligibility,
      duration
    });
  }
  
  trackLoanRequest(amount: number, success: boolean, errorType?: string) {
    this.analytics.track('loan_request', {
      amount,
      success,
      error_type: errorType,
      timestamp: Date.now()
    });
  }
}
```

### 📈 Métricas de Engagement y Retención

**User Engagement:**
```typescript
interface EngagementMetrics {
  // Interacción con la plataforma
  avgSessionDuration: number;        // Target: >5 minutos
  pagesPerSession: number;           // Target: >3
  returnUserRate: number;            // Target: >30%
  
  // Feature Adoption
  walletConnectionRetryRate: number; // Target: <10%
  multiPlatformUsageRate: number;    // Target: >60%
  loanRequestRepeatRate: number;     // Target: <5% (por diseño)
  
  // Social Sharing
  referralClickRate: number;         // Target: >15%
  socialShareRate: number;           // Target: >5%
}
```

### 🎨 Métricas de Diseño Visual

**Visual Design Effectiveness:**
```typescript
interface DesignMetrics {
  // Claridad visual
  visualHierarchyScore: number;      // Target: >4.5/5
  brandRecognitionRate: number;      // Target: >80%
  iconRecognitionRate: number;       // Target: >90%
  
  // Microinteracciones
  animationSmoothness: number;       // Target: 60fps
  feedbackTimeliness: number;        // Target: <200ms
  visualFeedbackCoverage: number;    // Target: 100%
  
  // Color y Contraste
  colorAccessibility: number;        // Target: AAA compliance
  darkModeUsageRate: number;         // Target: >40%
}
```

### 🔍 Testing y Validación UX

**A/B Testing Framework:**
```typescript
interface ABTestMetrics {
  // Landing Page Variants
  ctaButtonColorConversion: Record<string, number>;
  headlineVariantPerformance: Record<string, number>;
  
  // Wallet Connection UX
  walletProviderOrderOptimization: Record<string, number>;
  connectionFlowVariants: Record<string, number>;
  
  // Dashboard Layout
  progressIndicatorTypes: Record<string, number>;
  informationArchitecture: Record<string, number>;
}
```

### 📋 Implementación de Métricas

**Herramientas de Medición:**
- **Google Analytics 4** - Conversiones y funnel
- **Hotjar/FullStory** - Heatmaps y session recordings
- **Lighthouse CI** - Performance automatizada
- **Sentry** - Error tracking y performance
- **PostHog** - Product analytics y feature flags
- **Custom Dashboard** - Métricas específicas de DeFi

**Alertas y Umbrales:**
```typescript
const METRIC_THRESHOLDS = {
  performance: {
    lcp: 2500,      // ms
    fid: 100,       // ms
    cls: 0.1        // score
  },
  conversion: {
    wallet_connection: 0.75,  // 75%
    loan_completion: 0.35     // 35%
  },
  ux: {
    bounce_rate: 0.40,        // 40%
    satisfaction: 4.2         // /5
  }
};
```

---

## 🔄 FLUJO DE INTEGRACIÓN COMPLETA

### 📋 Checklist de Desarrollo

**Frontend (Next.js):**
- [ ] Configurar proyecto Next.js 15 con TypeScript
- [ ] Implementar conexión multi-wallet (Freighter, Albedo)
- [ ] Desarrollar componentes de UI/UX según diseño
- [ ] Integrar Stellar SDK para transacciones
- [ ] Implementar sistema de métricas y analytics
- [ ] Configurar A/B testing framework
- [ ] Optimizar Core Web Vitals
- [ ] Implementar manejo de estados y errores
- [ ] Testing E2E con Playwright
- [ ] Accessibility audit y WCAG compliance

**Backend (Node.js):**
- [ ] Configurar servidor Express con middleware
- [ ] Implementar endpoints de mock data
- [ ] Desarrollar motor de credit scoring
- [ ] Integrar cliente Stellar/Soroban
- [ ] Configurar base de datos con Prisma
- [ ] Implementar sistema de analytics server-side
- [ ] Testing unitario con Jest
- [ ] Performance monitoring
- [ ] Security audit

**Smart Contract (Soroban):**
- [ ] Desarrollar contrato en Rust
- [ ] Implementar lógica de validación
- [ ] Testing exhaustivo del contrato
- [ ] Deploy a Stellar Testnet
- [ ] Verificación y auditoría
- [ ] Gas optimization

**Analytics & Monitoring:**
- [ ] Dashboard de métricas real-time
- [ ] Alertas automáticas por umbrales
- [ ] Reports semanales automatizados
- [ ] Heatmaps y user recordings
- [ ] Performance monitoring continuo

### 🔐 Consideraciones de Seguridad

1. **Validación de Entrada:** Sanitizar todos los inputs del usuario
2. **Rate Limiting:** Implementar límites por IP y wallet
3. **Autenticación:** Verificar firmas de wallet en cada request
4. **Auditabilidad:** Logs completos de todas las transacciones
5. **Fondos del Contrato:** Implementar multisig para recargas
6. **Privacy:** Cumplimiento GDPR y anonimización de datos

### 📊 Métricas de Éxito MVP (Actualizadas)

**Métricas Primarias:**
- **Conversión End-to-End:** > 35% (landing → loan disbursed)
- **Tiempo de Procesamiento:** < 30 segundos promedio
- **Lighthouse Performance Score:** > 90
- **User Satisfaction Score:** > 4.2/5
- **Wallet Connection Success Rate:** > 95%
- **Loan Approval Accuracy:** > 98%

**Métricas Secundarias:**
- **Mobile Conversion Rate:** > 70% del desktop
- **Accessibility Score:** > 95
- **API Response Time:** < 200ms p95
- **Error Rate:** < 1% de todas las transacciones
- **User Retention (7 días):** > 25%

---

## 🚀 Próximos Pasos

1. **Sprint 1:** Setup inicial, analytics, y componentes básicos de Frontend
2. **Sprint 2:** Desarrollo del Backend y API endpoints
3. **Sprint 3:** Desarrollo del Smart Contract Soroban
4. **Sprint 4:** Integración completa, testing, y optimización UX
5. **Sprint 5:** Deployment, monitoring, y refinamiento basado en métricas

---

**Contacto del Stakeholder:** [Tu información de contacto]  
**Repositorio:** https://github.com/[usuario]/Lana  
**Dashboard de Métricas:** [URL del dashboard]  
**Documentación Técnica:** Stellar Developers Docs, Soroban Docs