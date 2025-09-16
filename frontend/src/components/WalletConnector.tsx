'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isConnected, requestAccess } from '@stellar/freighter-api';

export default function WalletConnector() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState('');
  const [freighterDetected, setFreighterDetected] = useState<boolean | null>(null);
  const router = useRouter();

  // Detectar Freighter al cargar el componente
  useEffect(() => {
    const detectFreighter = async () => {
      try {
        const connectionCheck = await isConnected();
        setFreighterDetected(!connectionCheck.error);
      } catch (error) {
        setFreighterDetected(false);
      }
    };
    
    detectFreighter();
  }, []);

  // Redirigir al dashboard si ya está conectado
  useEffect(() => {
    if (walletConnected && publicKey) {
      router.push('/dashboard');
    }
  }, [walletConnected, publicKey, router]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');

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

        setWalletConnected(true);
        setPublicKey(accessResponse.address);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_publicKey', accessResponse.address);
      } else {
        // Ya está conectado, solo necesitamos la clave pública
        const accessResponse = await requestAccess();
        
        if (accessResponse.error) {
          throw new Error('Error obteniendo la clave pública');
        }

        setWalletConnected(true);
        setPublicKey(accessResponse.address);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_publicKey', accessResponse.address);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error conectando wallet';
      setError(errorMessage);
      
      // Si es error de Freighter no instalado, mostrar instrucciones
      if (errorMessage.includes('no está instalado')) {
        setTimeout(() => {
          setError('Instala Freighter desde: https://freighter.app/ y luego recarga la página');
        }, 2000);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Mostrar estado de carga mientras detectamos Freighter
  if (freighterDetected === null) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Detectando Freighter...</span>
        </div>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Verificando si tienes la extensión Freighter instalada...
        </p>
      </div>
    );
  }

  // Mostrar mensaje si Freighter no está instalado
  if (freighterDetected === false) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-5 h-5">⚠️</div>
          <span>Freighter no detectado</span>
        </div>
        
        <a
          href="https://freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📥 Instalar Freighter
        </a>
        
        <p className="text-sm text-red-600 text-center max-w-md">
          Necesitas instalar la extensión Freighter para usar EBAS. Después de instalarla, recarga la página.
        </p>
      </div>
    );
  }

  // Si está conectado y redirigiendo, mostrar mensaje
  if (walletConnected && publicKey) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Wallet conectada</span>
        </div>
        <p className="text-sm text-green-600 font-mono">
          {formatAddress(publicKey)}
        </p>
        <p className="text-sm text-gray-600">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  // Freighter detectado, mostrar botón de conexión
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-5 h-5">🔗</div>
        <span>Wallet no conectada</span>
      </div>
      
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        👛 {isConnecting ? 'Conectando...' : 'Conectar Freighter'}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 text-center max-w-md">
          {error}
        </p>
      )}
      
      <p className="text-sm text-gray-500 text-center max-w-md">
        Conecta tu wallet Freighter para acceder a EBAS DeFi.
      </p>
    </div>
  );
}