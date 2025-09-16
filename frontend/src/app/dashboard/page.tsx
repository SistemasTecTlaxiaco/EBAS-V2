'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IncomeDashboard } from '@/components';

export default function Dashboard() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'income'>('overview');
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      const isConnected = localStorage.getItem('wallet_connected') === 'true';
      const walletPublicKey = localStorage.getItem('wallet_publicKey');

      if (!isConnected || !walletPublicKey) {
        // Si no está conectado, redirigir a la página principal
        router.push('/');
        return;
      }

      setPublicKey(walletPublicKey);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleDisconnect = () => {
    // Limpiar localStorage
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_publicKey');
    
    // Redirigir a la página principal
    router.push('/');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                EBAS Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Bienvenido a tu panel de control DeFi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Wallet Info */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">Wallet Conectada</p>
                  <p className="text-xs text-green-600 font-mono">
                    {formatAddress(publicKey || '')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Desconectar
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vista General
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'income'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Análisis de Ingresos
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ¡Bienvenido a EBAS DeFi! 👋
              </h2>
              <p className="text-gray-600 mb-4">
                Tu wallet está conectada y lista para usar. Aquí podrás gestionar tus préstamos, 
                proporcionar liquidez y administrar tu perfil crediticio en la blockchain de Stellar.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Tu dirección de wallet:</h3>
                <code className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-800 break-all">
                  {publicKey}
                </code>
              </div>
            </div>

            {/* Get Started with Income Analysis */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">
                🚀 Comienza tu Análisis de Ingresos
              </h2>
              <p className="mb-4 opacity-90">
                Conecta tus apps de trabajo (Uber, Rappi, etc.) para generar automáticamente 
                tu perfil crediticio y acceder a préstamos personalizados.
              </p>
              <button
                onClick={() => setActiveTab('income')}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Empezar Análisis →
              </button>
            </div>

            {/* Contract Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Contrato
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Contract ID</p>
                  <code className="text-sm bg-gray-800 text-white px-3 py-2 rounded block break-all font-mono">
                    CBFQHW5DNSJGVM4YLUPPLJ4VRAZGWZZYERYCCZYKIOC2BNUCK6WHJ2CT
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Red</p>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-2 rounded inline-block">
                    Stellar Testnet
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Credit Profile */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    👤
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Perfil Crediticio</h3>
                    <p className="text-sm text-gray-600">Gestiona tu historial</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('income')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generar Perfil
                </button>
              </div>

              {/* Request Loan */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    💰
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Solicitar Préstamo</h3>
                    <p className="text-sm text-gray-600">Obtener liquidez</p>
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Solicitar
                </button>
              </div>

              {/* Provide Liquidity */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    🏦
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Proveer Liquidez</h3>
                    <p className="text-sm text-gray-600">Ganar intereses</p>
                  </div>
                </div>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Proveer
                </button>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estado Actual
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Préstamos Activos</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0 XLM</div>
                  <div className="text-sm text-gray-600">Liquidez Proporcionada</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <IncomeDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              EBAS DeFi • Contrato: CBFQHW5DNSJGVM4YLUPPLJ4VRAZGWZZYERYCCZYKIOC2BNUCK6WHJ2CT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}