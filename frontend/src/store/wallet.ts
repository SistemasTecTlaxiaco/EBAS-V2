import { create } from 'zustand';
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { WalletState } from '@/types';

interface WalletStore extends WalletState {
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<void>;
}

import { create } from 'zustand';
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { WalletState } from '@/types';

interface WalletStore extends WalletState {
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  publicKey: null,
  isConnecting: false,
  error: null,

  connect: async () => {
    try {
      set({ isConnecting: true, error: null });

      // Verificar que estamos en el navegador
      if (typeof window === 'undefined') {
        throw new Error('Esta función solo está disponible en el navegador');
      }

      // Verificar si Freighter está disponible
      const connectionCheck = await isConnected();
      
      if (connectionCheck.error) {
        throw new Error('Freighter wallet no está instalado. Por favor instala la extensión Freighter y recarga la página.');
      }

      // Si no está conectado, solicitar acceso
      if (!connectionCheck.isConnected) {
        const accessResponse = await requestAccess();
        
        if (accessResponse.error) {
          throw new Error('Usuario canceló la conexión o Freighter no está disponible.');
        }

        set({
          isConnected: true,
          publicKey: accessResponse.address,
          isConnecting: false,
        });

        // Guardar en localStorage para persistencia
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_publicKey', accessResponse.address);
      } else {
        // Ya está conectado, solo necesitamos la clave pública
        const accessResponse = await requestAccess();
        
        if (accessResponse.error) {
          throw new Error('Error obteniendo la clave pública');
        }

        set({
          isConnected: true,
          publicKey: accessResponse.address,
          isConnecting: false,
        });

        // Guardar en localStorage para persistencia
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_publicKey', accessResponse.address);
      }

    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({ 
        isConnecting: false, 
        error: error instanceof Error ? error.message : 'Error conectando wallet' 
      });
      throw error;
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      publicKey: null,
      error: null,
    });

    // Limpiar localStorage
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_publicKey');
  },

  checkConnection: async () => {
    try {
      const connectionCheck = await isConnected();
      
      if (connectionCheck.isConnected) {
        const accessResponse = await requestAccess();
        
        if (!accessResponse.error) {
          set({
            isConnected: true,
            publicKey: accessResponse.address,
          });
          
          // Actualizar localStorage
          localStorage.setItem('wallet_connected', 'true');
          localStorage.setItem('wallet_publicKey', accessResponse.address);
        }
      } else {
        // No está conectado, limpiar estado
        get().disconnect();
      }
    } catch (error) {
      console.warn('Error checking wallet connection:', error);
      get().disconnect();
    }
  },
}));

// Hook para inicializar la conexión desde localStorage
export const initializeWallet = async () => {
  // Esperar a que la ventana esté completamente cargada
  if (typeof window === 'undefined') return;
  
  const isConnectedStored = localStorage.getItem('wallet_connected') === 'true';
  const publicKey = localStorage.getItem('wallet_publicKey');

  if (isConnectedStored && publicKey) {
    // Verificar que Freighter siga conectado
    try {
      const connectionCheck = await isConnected();
      
      if (connectionCheck.isConnected) {
        useWalletStore.setState({
          isConnected: true,
          publicKey,
        });
      } else {
        // Si no está conectada, limpiar el estado
        useWalletStore.getState().disconnect();
      }
    } catch (error) {
      console.warn('Error during wallet initialization:', error);
      useWalletStore.getState().disconnect();
    }
  }
};

// Hook para inicializar la conexión desde localStorage
export const initializeWallet = async () => {
  // Esperar a que la ventana esté completamente cargada
  if (typeof window === 'undefined') return;
  
  const isConnectedStored = localStorage.getItem('wallet_connected') === 'true';
  const publicKey = localStorage.getItem('wallet_publicKey');

  if (isConnectedStored && publicKey) {
    // Verificar que Freighter siga conectado
    try {
      const connectionCheck = await isConnected();
      
      if (connectionCheck.isConnected) {
        useWalletStore.setState({
          isConnected: true,
          publicKey,
        });
      } else {
        // Si no está conectada, limpiar el estado
        useWalletStore.getState().disconnect();
      }
    } catch (error) {
      console.warn('Error during wallet initialization:', error);
      useWalletStore.getState().disconnect();
    }
  }
};