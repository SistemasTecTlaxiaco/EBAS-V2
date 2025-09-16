# EBAS - Emergency Banking Assistance System

## Descripción
EBAS (Emergency Banking Assistance System) es una plataforma DeFi construida sobre Stellar que proporciona servicios financieros de emergencia para trabajadores de la economía gig.

## Características Principales
- 🏦 **Préstamos rápidos**: Acceso inmediato a liquidez basado en historial de ingresos
- 📊 **Scoring crediticio**: Sistema automatizado de evaluación de riesgo 
- 🔄 **Pools de liquidez**: Oportunidades de inversión para proveedores de capital
- 📱 **Interfaz web**: Dashboard intuitivo conectado con Freighter wallet
- ⚡ **Smart contracts**: Contratos inteligentes en Soroban para máxima seguridad

## Estructura del Proyecto

```text
.
├── contracts/          # Contratos inteligentes Soroban
│   └── ebas-defi/     # Contrato principal de préstamos DeFi
├── frontend/          # Aplicación web Next.js
│   ├── src/
│   │   ├── app/      # App Router de Next.js
│   │   ├── components/ # Componentes React
│   │   └── contexts/  # Context providers
│   └── public/       # Assets estáticos
├── mcp-server/       # Servidor MCP para integración
└── target/           # Binarios compilados de Rust

```

## Tecnologías Utilizadas
- **Backend**: Soroban (Stellar Smart Contracts) + Rust
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Wallet**: Freighter API integration
- **Blockchain**: Stellar Network (Testnet/Mainnet)

## Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- Rust + Cargo
- Soroban CLI
- Freighter Wallet Extension

### Configuración
```bash
# Clonar repositorio
git clone <repo-url>
cd EBAS

# Instalar dependencias frontend
cd frontend && npm install

# Compilar contratos
cargo build --release

# Ejecutar aplicación
npm run dev
```

## Estado del Desarrollo
- ✅ Integración completa con Freighter Wallet
- ✅ Landing page y dashboard responsivo
- ✅ Arquitectura de componentes React
- ✅ Context API para manejo de estado Stellar
- 🔄 Implementación de contratos inteligentes (en progreso)
- ⏳ Sistema de scoring crediticio
- ⏳ Tests unitarios y de integración

## Contribución
Este proyecto sigue las mejores prácticas de desarrollo con:
- TypeScript para type safety
- Tailwind CSS para styling consistente
- Git flow para manejo de versiones
- Testing automatizado

---
**EBAS** - Democratizando el acceso a servicios financieros para la economía gig 🚀
