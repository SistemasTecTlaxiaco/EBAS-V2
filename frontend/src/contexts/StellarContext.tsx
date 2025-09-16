'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StellarClient, StellarAccount, NETWORKS } from '@/lib/stellar';
import { useFreighter } from '@/hooks/useFreighter';
import * as StellarSdk from '@stellar/stellar-sdk';

interface StellarContextType {
  client: StellarClient;
  account: StellarAccount | null;
  network: keyof typeof NETWORKS;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: keyof typeof NETWORKS) => void;
  balance: string | null;
  loading: boolean;
  error: string | null;
  signTransaction: (xdr: string) => Promise<string>;
  submitTransaction: (signedXdr: string) => Promise<any>;
  refreshBalance: () => Promise<void>;
}

const StellarContext = createContext<StellarContextType | undefined>(undefined);

export function StellarProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<StellarClient>(new StellarClient());
  const [account, setAccount] = useState<StellarAccount | null>(null);
  const [network, setNetwork] = useState<keyof typeof NETWORKS>('testnet');
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Integración con hook Freighter
  const freighter = useFreighter();

  const isConnected = account !== null || freighter.wallet.isConnected;

  // Actualizar balance
  const updateBalance = async (publicKey: string) => {
    try {
      const accountInfo = await client.getAccount(publicKey);
      const xlmBalance = accountInfo.balances.find((b: any) => b.asset_type === 'native');
      setBalance(xlmBalance ? xlmBalance.balance : '0');
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance('0');
    }
  };

  // Refresh balance function
  const refreshBalance = useCallback(async () => {
    const publicKey = account?.publicKey || freighter.wallet.publicKey;
    if (publicKey) {
      await updateBalance(publicKey);
    }
  }, [account, freighter.wallet.publicKey, client]);

  // Conectar wallet - Integra con Freighter
  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      // Primero intenta conectar con Freighter
      const freighterConnected = await freighter.connect();
      
      if (freighterConnected && freighter.wallet.publicKey) {
        // Usar datos de Freighter
        setAccount({ publicKey: freighter.wallet.publicKey });
        await updateBalance(freighter.wallet.publicKey);
        
        // Sincronizar red si es diferente
        if (freighter.wallet.network !== network) {
          setNetwork(freighter.wallet.network as keyof typeof NETWORKS);
          const newClient = new StellarClient(freighter.wallet.network as keyof typeof NETWORKS);
          setClient(newClient);
        }
      } else {
        // Fallback a integración manual de Freighter
        if (typeof window !== 'undefined' && (window as any).freighterApi) {
          const freighterApi = (window as any).freighterApi;
          
          const isAllowed = await freighterApi.isAllowed();
          if (!isAllowed) {
            await freighterApi.requestAccess();
          }

          const publicKey = await freighterApi.getPublicKey();
          setAccount({ publicKey });
          await updateBalance(publicKey);
        } else {
          throw new Error('Freighter wallet not available. Please install Freighter extension.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Desconectar wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setError(null);
    freighter.disconnect();
    localStorage.removeItem('stellar-account');
  };

  // Cambiar red
  const switchNetwork = (newNetwork: keyof typeof NETWORKS) => {
    setNetwork(newNetwork);
    const newClient = new StellarClient(newNetwork);
    setClient(newClient);
    
    // Actualizar red en Freighter también
    freighter.switchNetwork(newNetwork);
    
    // Actualizar balance si hay cuenta conectada
    const publicKey = account?.publicKey || freighter.wallet.publicKey;
    if (publicKey) {
      updateBalance(publicKey);
    }
  };

  // Firmar transacción usando Freighter
  const signTransaction = async (xdr: string): Promise<string> => {
    try {
      if (freighter.wallet.isConnected) {
        return await freighter.signTransaction(xdr);
      } else if (typeof window !== 'undefined' && (window as any).freighterApi) {
        const freighterApi = (window as any).freighterApi;
        const result = await freighterApi.signTransaction(xdr, {
          networkPassphrase: NETWORKS[network].networkPassphrase,
          accountToSign: account?.publicKey || freighter.wallet.publicKey,
        });
        return result.signedTransaction;
      } else {
        throw new Error('No wallet available for signing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign transaction');
      throw err;
    }
  };

  // Enviar transacción
  const submitTransaction = async (signedXdr: string): Promise<any> => {
    try {
      // Crear TransactionBuilder y enviar usando el server interno del cliente
      const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORKS[network].networkPassphrase);
      return await client.getAccount(account?.publicKey || freighter.wallet.publicKey!)
        .then(() => {
          // Para ahora, implementaremos esto más adelante cuando tengamos transacciones reales
          throw new Error('Transaction submission not fully implemented yet');
        });
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction');
      throw err;
    }
  };

  // Efecto para sincronizar con Freighter
  useEffect(() => {
    if (freighter.wallet.isConnected && freighter.wallet.publicKey) {
      setAccount({ publicKey: freighter.wallet.publicKey });
      updateBalance(freighter.wallet.publicKey);
      
      // Sincronizar red
      if (freighter.wallet.network !== network) {
        setNetwork(freighter.wallet.network as keyof typeof NETWORKS);
        const newClient = new StellarClient(freighter.wallet.network as keyof typeof NETWORKS);
        setClient(newClient);
      }
    }
  }, [freighter.wallet.isConnected, freighter.wallet.publicKey, freighter.wallet.network]);

  // Efecto para cargar cuenta desde localStorage (fallback)
  useEffect(() => {
    if (!freighter.wallet.isConnected) {
      const savedAccount = localStorage.getItem('stellar-account');
      if (savedAccount) {
        try {
          const parsedAccount = JSON.parse(savedAccount);
          setAccount(parsedAccount);
          updateBalance(parsedAccount.publicKey);
        } catch (err) {
          console.error('Failed to parse saved account:', err);
          localStorage.removeItem('stellar-account');
        }
      }
    }
  }, [freighter.wallet.isConnected]);

  // Efecto para guardar cuenta en localStorage
  useEffect(() => {
    if (account && !freighter.wallet.isConnected) {
      localStorage.setItem('stellar-account', JSON.stringify(account));
    }
  }, [account, freighter.wallet.isConnected]);

  const value: StellarContextType = {
    client,
    account: account || (freighter.wallet.isConnected ? { publicKey: freighter.wallet.publicKey! } : null),
    network,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    balance,
    loading: loading || freighter.loading,
    error: error || (freighter.error ? freighter.getErrorMessage(freighter.error) : null),
    signTransaction,
    submitTransaction,
    refreshBalance,
  };

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  );
}

export function useStellar() {
  const context = useContext(StellarContext);
  if (context === undefined) {
    throw new Error('useStellar must be used within a StellarProvider');
  }
  return context;
}