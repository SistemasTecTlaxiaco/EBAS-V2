'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  isConnected as freighterIsConnected, 
  requestAccess as freighterRequestAccess, 
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
  getNetwork as freighterGetNetwork,
  WatchWalletChanges
} from '@stellar/freighter-api';
import { NETWORKS } from '@/lib/stellar';

export interface FreighterWallet {
  publicKey: string | null;
  isConnected: boolean;
  isAvailable: boolean;
  network: keyof typeof NETWORKS;
}

export interface FreighterError {
  code: string;
  message: string;
  details?: string;
}

const FREIGHTER_ERRORS = {
  NOT_INSTALLED: 'FREIGHTER_NOT_INSTALLED',
  CONNECTION_REJECTED: 'CONNECTION_REJECTED',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export function useFreighter() {
  const [wallet, setWallet] = useState<FreighterWallet>({
    publicKey: null,
    isConnected: false,
    isAvailable: false,
    network: 'testnet'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FreighterError | null>(null);

  // Verificar si Freighter está disponible usando la API oficial
  const checkFreighterAvailability = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Usar la detección oficial de Freighter
    const isAvailable = typeof window !== 'undefined' && 
      'freighter' in window && 
      typeof (window as any).freighter?.isConnected === 'function';
    
    setWallet(prev => ({ ...prev, isAvailable }));
    return isAvailable;
  }, []);

  // Conectar wallet usando la API oficial
  const connect = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!checkFreighterAvailability()) {
        throw new Error('Freighter wallet extension is not installed. Please install it from the Chrome Web Store.');
      }

      // Usar la API oficial para solicitar acceso
      const accessResult = await freighterRequestAccess();
      
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }

      if (!accessResult.address) {
        throw new Error('No address returned from Freighter');
      }

      // Obtener la red actual
      const networkResult = await freighterGetNetwork();
      
      setWallet(prev => ({
        ...prev,
        publicKey: accessResult.address,
        isConnected: true,
        network: (networkResult.network as keyof typeof NETWORKS) || 'testnet'
      }));

      // Guardar en localStorage
      localStorage.setItem('freighter_connected', 'true');
      localStorage.setItem('freighter_public_key', accessResult.address);
      localStorage.setItem('freighter_network', networkResult.network || 'testnet');

      return true;
    } catch (err: any) {
      console.error('Freighter connection error:', err);
      
      let freighterError: FreighterError;
      
      if (err.message?.includes('not installed') || err.message?.includes('not available')) {
        freighterError = {
          code: FREIGHTER_ERRORS.NOT_INSTALLED,
          message: 'Freighter wallet extension not found',
          details: 'Please install Freighter from the Chrome Web Store and refresh the page.'
        };
      } else if (err.message?.includes('rejected') || err.message?.includes('denied') || err.message?.includes('User rejected')) {
        freighterError = {
          code: FREIGHTER_ERRORS.CONNECTION_REJECTED,
          message: 'Connection request rejected',
          details: 'Please approve the connection request in Freighter wallet.'
        };
      } else if (err.message?.includes('not authorized')) {
        freighterError = {
          code: FREIGHTER_ERRORS.NOT_AUTHORIZED,
          message: 'Wallet access not authorized',
          details: 'Please authorize this application in Freighter settings.'
        };
      } else {
        freighterError = {
          code: FREIGHTER_ERRORS.UNKNOWN_ERROR,
          message: 'Failed to connect wallet',
          details: err.message || 'An unexpected error occurred while connecting to Freighter.'
        };
      }

      setError(freighterError);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkFreighterAvailability]);

  // Desconectar wallet
  const disconnect = useCallback(() => {
    setWallet(prev => ({
      ...prev,
      publicKey: null,
      isConnected: false
    }));
    
    setError(null);
    
    // Limpiar localStorage
    localStorage.removeItem('freighter_connected');
    localStorage.removeItem('freighter_public_key');
    localStorage.removeItem('freighter_network');
  }, []);

  // Firmar transacción usando la API oficial
  const signTransaction = useCallback(async (
    transactionXdr: string,
    options?: {
      network?: keyof typeof NETWORKS;
      accountToSign?: string;
    }
  ): Promise<string> => {
    if (!wallet.isConnected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const networkPassphrase = NETWORKS[options?.network || wallet.network].networkPassphrase;
      
      // Usar la API oficial para firmar
      const result = await freighterSignTransaction(transactionXdr, {
        networkPassphrase: networkPassphrase,
        address: options?.accountToSign || wallet.publicKey,
      });

      if (!result.signedTxXdr) {
        throw new Error('No signed transaction returned');
      }

      return result.signedTxXdr;
    } catch (err: any) {
      console.error('Transaction signing error:', err);
      
      let freighterError: FreighterError;
      
      if (err.message?.includes('User rejected')) {
        freighterError = {
          code: FREIGHTER_ERRORS.TRANSACTION_REJECTED,
          message: 'Transaction signing rejected',
          details: 'Transaction was rejected by user in Freighter wallet.'
        };
      } else {
        freighterError = {
          code: FREIGHTER_ERRORS.TRANSACTION_REJECTED,
          message: 'Transaction signing failed',
          details: err.message || 'Transaction was rejected or failed to sign.'
        };
      }

      setError(freighterError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wallet.isConnected, wallet.publicKey, wallet.network]);

  // Cambiar red
  const switchNetwork = useCallback((network: keyof typeof NETWORKS) => {
    setWallet(prev => ({ ...prev, network }));
    localStorage.setItem('freighter_network', network);
  }, []);

  // Verificar el estado de conexión al cargar usando la API oficial
  useEffect(() => {
    const initializeWallet = async () => {
      checkFreighterAvailability();

      if (!wallet.isAvailable) return;

      try {
        // Usar la API oficial para verificar conexión
        const connected = await freighterIsConnected();
        
        if (connected.isConnected) {
          // Obtener la dirección actual
          const addressResult = await freighterGetAddress();
          const networkResult = await freighterGetNetwork();
          
          if (addressResult.address) {
            setWallet(prev => ({
              ...prev,
              publicKey: addressResult.address,
              isConnected: true,
              network: (networkResult.network as keyof typeof NETWORKS) || 'testnet'
            }));
            
            // Actualizar localStorage
            localStorage.setItem('freighter_connected', 'true');
            localStorage.setItem('freighter_public_key', addressResult.address);
            localStorage.setItem('freighter_network', networkResult.network || 'testnet');
          }
        } else {
          // Si no está conectado, limpiar estado guardado
          const savedConnection = localStorage.getItem('freighter_connected');
          if (savedConnection === 'true') {
            disconnect();
          }
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
        // En caso de error, limpiar estado guardado
        disconnect();
      }
    };

    initializeWallet();
  }, [wallet.isAvailable, checkFreighterAvailability, disconnect]);

  // Escuchar cambios de wallet usando la API oficial
  useEffect(() => {
    if (!wallet.isAvailable || !wallet.isConnected) return;

    let watchWalletChanges: any;

    try {
      // Usar la clase oficial WatchWalletChanges con el callback correcto
      const handleWalletChange = async () => {
        console.log('Freighter wallet changed');
        
        try {
          // Verificar si sigue conectado
          const connected = await freighterIsConnected();
          
          if (!connected.isConnected) {
            // Si se desconectó, limpiar el estado
            disconnect();
          } else {
            // Verificar si cambió la cuenta
            const addressResult = await freighterGetAddress();
            if (addressResult.address && addressResult.address !== wallet.publicKey) {
              const networkResult = await freighterGetNetwork();
              
              setWallet(prev => ({
                ...prev,
                publicKey: addressResult.address,
                isConnected: true,
                network: (networkResult.network as keyof typeof NETWORKS) || prev.network
              }));
              
              // Actualizar localStorage
              localStorage.setItem('freighter_public_key', addressResult.address);
              localStorage.setItem('freighter_network', networkResult.network || 'testnet');
            }
          }
        } catch (err) {
          console.error('Error handling wallet change:', err);
          disconnect();
        }
      };

      // Configurar el listener (intentar usar la clase oficial)
      if (typeof WatchWalletChanges === 'function') {
        watchWalletChanges = new WatchWalletChanges(5000); // intervalo en ms
        watchWalletChanges.onChange = handleWalletChange;
      }
    } catch (err) {
      console.error('Error setting up wallet watcher:', err);
      
      // Fallback: verificar periódicamente si WatchWalletChanges no funciona
      const intervalId = setInterval(async () => {
        if (wallet.isConnected) {
          try {
            const connected = await freighterIsConnected();
            if (!connected.isConnected) {
              disconnect();
            } else {
              const addressResult = await freighterGetAddress();
              if (addressResult.address && addressResult.address !== wallet.publicKey) {
                const networkResult = await freighterGetNetwork();
                setWallet(prev => ({
                  ...prev,
                  publicKey: addressResult.address,
                  network: (networkResult.network as keyof typeof NETWORKS) || prev.network
                }));
              }
            }
          } catch (err) {
            console.error('Error checking wallet status:', err);
            disconnect();
          }
        }
      }, 10000); // Verificar cada 10 segundos

      return () => clearInterval(intervalId);
    }

    return () => {
      if (watchWalletChanges) {
        try {
          watchWalletChanges.stop();
        } catch (err) {
          console.error('Error stopping wallet watcher:', err);
        }
      }
    };
  }, [wallet.isAvailable, wallet.isConnected, wallet.publicKey, disconnect]);

  return {
    wallet,
    loading,
    error,
    connect,
    disconnect,
    signTransaction,
    switchNetwork,
    checkAvailability: checkFreighterAvailability,
    
    // Utilidades
    isInstalled: wallet.isAvailable,
    isConnected: wallet.isConnected,
    publicKey: wallet.publicKey,
    network: wallet.network,
    
    // Helpers para UI
    getInstallUrl: () => 'https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk',
    getErrorMessage: (error: FreighterError) => error.details || error.message,
  };
}