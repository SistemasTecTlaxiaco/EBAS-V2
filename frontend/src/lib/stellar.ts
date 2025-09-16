import * as StellarSdk from '@stellar/stellar-sdk';

// Configuración de red
export const NETWORKS = {
  testnet: {
    networkPassphrase: StellarSdk.Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  futurenet: {
    networkPassphrase: StellarSdk.Networks.FUTURENET,
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    friendbotUrl: 'https://friendbot-futurenet.stellar.org',
  },
  mainnet: {
    networkPassphrase: StellarSdk.Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    friendbotUrl: null,
  },
};

// Configuración por defecto
export const DEFAULT_NETWORK = 'testnet';

// Tipos para contratos
export interface ContractInfo {
  id: string;
  name: string;
  wasmHash?: string;
}

export interface StellarAccount {
  publicKey: string;
  secretKey?: string;
}

export interface ContractMethod {
  name: string;
  args: Array<{
    name: string;
    type: string;
    value?: any;
  }>;
}

// Configuración del cliente Stellar
export class StellarClient {
  private server: any;
  private network: keyof typeof NETWORKS;

  constructor(network: keyof typeof NETWORKS = DEFAULT_NETWORK) {
    this.network = network;
    this.server = new StellarSdk.Horizon.Server(NETWORKS[network].horizonUrl);
  }

  async getAccount(publicKey: string) {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Failed to load account: ${error}`);
    }
  }

  async fundAccount(publicKey: string) {
    if (this.network === 'mainnet') {
      throw new Error('Cannot fund accounts on mainnet');
    }
    
    try {
      const response = await fetch(`${NETWORKS[this.network].friendbotUrl}?addr=${publicKey}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fund account: ${error}`);
    }
  }

  getNetworkPassphrase() {
    return NETWORKS[this.network].networkPassphrase;
  }

  switchNetwork(network: keyof typeof NETWORKS) {
    this.network = network;
    this.server = new StellarSdk.Horizon.Server(NETWORKS[network].horizonUrl);
  }
}