# Soroban MCP Server

Un servidor MCP (Model Context Protocol) para desarrollo de contratos inteligentes Soroban en Stellar.

## Características

- **Compilación**: Build de contratos Soroban
- **Testing**: Ejecución de tests
- **Despliegue**: Deploy a redes Stellar (testnet, futurenet, mainnet)
- **Invocación**: Llamadas a funciones de contratos desplegados
- **Gestión de cuentas**: Información de cuentas y generación de keypairs
- **Exploración**: Listado de contratos en el workspace

## Instalación

```bash
cd mcp-server
npm install
```

## Uso

### Iniciar el servidor
```bash
npm start
```

### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

## Herramientas disponibles

### `soroban_build`
Compila contratos Soroban
- **contract_path** (opcional): Ruta al directorio del contrato

### `soroban_test`
Ejecuta tests de contratos Soroban
- **contract_path** (opcional): Ruta al directorio del contrato

### `soroban_deploy`
Despliega un contrato a la red Stellar
- **contract_path**: Ruta al archivo WASM del contrato
- **network**: Red de destino (testnet, futurenet, mainnet)
- **source**: Cuenta origen para el despliegue

### `soroban_invoke`
Invoca una función de un contrato desplegado
- **contract_id**: ID del contrato a invocar
- **function_name**: Nombre de la función
- **args**: Argumentos de la función (array)
- **network**: Red a usar
- **source**: Cuenta origen para la transacción

### `stellar_account_info`
Obtiene información de una cuenta Stellar
- **account_id**: ID de la cuenta a consultar
- **network**: Red a consultar

### `generate_keypair`
Genera un nuevo par de claves Stellar

### `list_contracts`
Lista todos los contratos en el workspace

## Configuración

El servidor se ejecuta usando stdio transport y está listo para integrarse con clientes MCP.

## Requisitos

- Node.js 18+
- Soroban CLI instalado
- Stellar CLI instalado