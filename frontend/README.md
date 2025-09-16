# Frontend - Lana Soroban DApp

Un frontend Next.js moderno para interactuar con contratos inteligentes Soroban en la blockchain de Stellar.

## 🚀 Características

- **Framework**: Next.js 15 con TypeScript
- **Estilos**: Tailwind CSS
- **Wallet**: Integración con Freighter Wallet
- **SDK**: Stellar SDK para interacciones blockchain
- **Componentes**: Módulos reutilizables para desarrollo

## 🛠️ Componentes Principales

### WalletConnection
- Conexión/desconexión de wallet Freighter
- Cambio de redes (testnet, futurenet, mainnet)
- Visualización de balance XLM
- Gestión de estado de cuenta

### ContractManager
- Listado de contratos en el workspace
- Build de contratos Soroban
- Deploy a redes Stellar
- Interfaz para gestión completa

### ContractInteraction
- Invocación de funciones de contratos
- Entrada de argumentos dinámicos
- Visualización de resultados
- Manejo de errores

## 🔧 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

## 🌐 URL del Proyecto

- **Desarrollo**: http://localhost:3000
- **Red Local**: http://10.150.1.197:3000

## 📦 Dependencias

- Next.js 15.5.3
- React 18
- TypeScript
- Tailwind CSS
- @stellar/stellar-sdk
- @stellar/freighter-api

## 🔄 Integración con Backend

El frontend está preparado para conectarse con:
- **MCP Server** (puerto por configurar)
- **Contratos Soroban** desplegados
- **Red Stellar** (testnet/mainnet)

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout base
│   └── globals.css       # Estilos globales
├── components/
│   ├── WalletConnection.tsx
│   ├── ContractManager.tsx
│   └── ContractInteraction.tsx
├── contexts/
│   └── StellarContext.tsx # Context global Stellar
└── lib/
    └── stellar.ts         # Utilidades Stellar SDK
```

## ✨ Funcionalidades Listas

✅ **Wallet Connection**
✅ **Contract Management** 
✅ **Contract Interaction**
✅ **Stellar SDK Integration**
✅ **Responsive Design**
✅ **TypeScript Support**

## 🔮 Próximos Pasos

- [ ] Conectar con MCP Server para operaciones reales
- [ ] Implementar funcionalidades de Quick Actions
- [ ] Agregar más validaciones y manejo de errores
- [ ] Mejorar la UX/UI
- [ ] Agregar tests unitarios
