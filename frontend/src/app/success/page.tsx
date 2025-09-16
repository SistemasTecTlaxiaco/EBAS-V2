'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoanSuccess {
  amount: number;
  transactionHash: string;
  timestamp: number;
  recipientAddress: string;
}

export default function SuccessPage() {
  const [loanData, setLoanData] = useState<LoanSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Obtener datos del préstamo de localStorage o parámetros URL
    const loadLoanData = () => {
      const storedData = localStorage.getItem('loanProcessed');
      const urlAmount = searchParams.get('amount');
      const urlHash = searchParams.get('hash');

      let data: LoanSuccess | null = null;

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        data = {
          amount: parsedData.amount,
          transactionHash: parsedData.transactionHash,
          timestamp: parsedData.timestamp,
          recipientAddress: localStorage.getItem('wallet_publicKey') || 'Unknown'
        };
      } else if (urlAmount && urlHash) {
        data = {
          amount: parseFloat(urlAmount),
          transactionHash: urlHash,
          timestamp: Date.now(),
          recipientAddress: localStorage.getItem('wallet_publicKey') || 'Unknown'
        };
      }

      if (!data) {
        // Si no hay datos, redirigir al dashboard
        router.push('/dashboard');
        return;
      }

      setLoanData(data);
      setIsLoading(false);

      // Limpiar datos almacenados después de mostrarlos
      setTimeout(() => {
        localStorage.removeItem('loanProcessed');
        localStorage.removeItem('creditAnalysis');
      }, 1000);
    };

    loadLoanData();
  }, [router, searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
  };

  const openStellarExplorer = () => {
    if (loanData) {
      // URL del explorador de Stellar Testnet
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${loanData.transactionHash}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando transacción...</p>
        </div>
      </div>
    );
  }

  if (!loanData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600">🎉 ¡Préstamo Aprobado y Desembolsado!</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Confirmación Principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            ¡Transacción Exitosa!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu préstamo ha sido procesado y transferido exitosamente a tu wallet
          </p>
          
          {/* Monto */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="text-sm text-green-700 mb-2">Monto Transferido</div>
            <div className="text-4xl font-bold text-green-600">
              {formatCurrency(loanData.amount)}
            </div>
          </div>
        </div>

        {/* Detalles de la Transacción */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Detalles de la Transacción
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Fecha y Hora:</span>
              <span className="font-semibold">{formatDate(loanData.timestamp)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Wallet Destino:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{formatAddress(loanData.recipientAddress)}</span>
                <button
                  onClick={() => copyToClipboard(loanData.recipientAddress)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Transaction Hash:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{formatAddress(loanData.transactionHash)}</span>
                <button
                  onClick={() => copyToClipboard(loanData.transactionHash)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Red:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">Stellar Testnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                // Simular apertura de wallet (Freighter)
                alert('Abriendo Freighter Wallet...');
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              👛 Ver en Wallet
            </button>

            <button
              onClick={openStellarExplorer}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔍 Ver en Stellar Explorer
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Información Adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-800 mb-3">
            📌 Información Important
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              • Los fondos están ahora disponibles en tu wallet de Stellar
            </p>
            <p>
              • El período de repago es de 30 días desde hoy
            </p>
            <p>
              • Recibirás recordatorios automáticos antes del vencimiento
            </p>
            <p>
              • Puedes realizar el pago anticipado en cualquier momento sin penalización
            </p>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-green-300">
          <div className="text-2xl mb-2">🌟</div>
          <h3 className="font-semibold text-gray-900 mb-2">
            ¿Te ha gustado EBAS?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Comparte tu experiencia y ayuda a otros trabajadores independientes
          </p>
          <button
            onClick={() => {
              // Simular compartir en redes sociales
              const shareText = `¡Acabo de obtener un préstamo de ${formatCurrency(loanData.amount)} en @EbasDefi! 🚀 Plataforma DeFi increíble para trabajadores independientes. #DeFi #Stellar #Gig`;
              if (navigator.share) {
                navigator.share({
                  title: 'EBAS DeFi',
                  text: shareText,
                  url: window.location.origin
                });
              } else {
                copyToClipboard(shareText + ' ' + window.location.origin);
              }
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Compartir Experiencia
          </button>
        </div>
      </div>
    </div>
  );
}