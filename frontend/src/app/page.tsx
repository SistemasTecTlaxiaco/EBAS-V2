'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletConnector } from '@/components';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está conectado al cargar la página
    const checkConnection = () => {
      const isConnected = localStorage.getItem('wallet_connected') === 'true';
      const publicKey = localStorage.getItem('wallet_publicKey');

      if (isConnected && publicKey) {
        // Si ya está conectado, redirigir al dashboard
        router.push('/dashboard');
        return;
      }

      setIsLoading(false);
    };

    // Esperar un poco para que se cargue el localStorage
    setTimeout(checkConnection, 500);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Verificando conexión...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              EBAS - Emergency Banking Assistance System
            </h1>
            <p className="text-gray-600 mt-2">
              Plataforma DeFi para servicios financieros de emergencia en Stellar
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a EBAS DeFi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Una plataforma descentralizada para préstamos y liquidez, 
            diseñada para trabajadores independientes y servicios de emergencia.
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div className="max-w-md mx-auto">
          <WalletConnector />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Préstamos Rápidos</h3>
            <p className="text-gray-600 text-sm">
              Obtén liquidez inmediata basada en tu perfil crediticio
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Proveer Liquidez</h3>
            <p className="text-gray-600 text-sm">
              Gana intereses proporcionando liquidez a otros usuarios
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro y Transparente</h3>
            <p className="text-gray-600 text-sm">
              Construido en Stellar Soroban con smart contracts verificables
            </p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-16 p-6 bg-white/40 backdrop-blur-sm rounded-lg border border-white/30">
          <h3 className="text-lg font-semibold text-blue-600 mb-4 text-center">
            Información del Contrato
          </h3>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Contract ID</p>
            <code className="text-xs bg-white/60 px-3 py-2 rounded border break-all">
              CBFQHW5DNSJGVM4YLUPPLJ4VRAZGWZZYERYCCZYKIOC2BNUCK6WHJ2CT
            </code>
            <div className="mt-3">
              <span className="inline-flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Stellar Testnet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              EBAS DeFi © 2025 • Construido en Stellar Soroban
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
