'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditProfile } from '@/components';

// Tipos según las especificaciones del MVP
interface CreditProfileData {
  walletAddress: string;
  eligibility: 'approved' | 'rejected';
  creditScore: number; // Interno, no mostrado al cliente según MVP
  loanAmount?: number;
  weeklyAverage: number;
  totalEarnings: number;
  connectedPlatforms: number;
  consistencyScore: number;
  platformsData: {
    platform: string;
    earnings: number;
    icon: string;
  }[];
  terms: {
    interestRate: number;
    repaymentPeriod: number; // días
    processingFee: number;
  };
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<CreditProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingLoan, setIsProcessingLoan] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simular carga del perfil crediticio desde localStorage o API
    const loadProfile = () => {
      const walletAddress = localStorage.getItem('wallet_publicKey');
      
      if (!walletAddress) {
        router.push('/');
        return;
      }

      // Simular datos del perfil según MVP con más detalle
      const mockProfile: CreditProfileData = {
        walletAddress,
        eligibility: 'approved', // Cambiar a 'rejected' para probar
        creditScore: 750, // Interno, no se muestra
        loanAmount: 230,
        weeklyAverage: 460,
        totalEarnings: 1840,
        connectedPlatforms: 3,
        consistencyScore: 85,
        platformsData: [
          { platform: 'uber', earnings: 920, icon: '🚗' },
          { platform: 'rappi', earnings: 650, icon: '🛵' },
          { platform: 'didi', earnings: 270, icon: '🚕' }
        ],
        terms: {
          interestRate: 5.5, // % anual
          repaymentPeriod: 30, // días
          processingFee: 5 // USD
        }
      };

      // Simular variación de datos basado en wallet address
      if (walletAddress.endsWith('A')) {
        mockProfile.eligibility = 'rejected';
        mockProfile.loanAmount = 0;
        mockProfile.weeklyAverage = 340;
        mockProfile.totalEarnings = 1360;
        mockProfile.consistencyScore = 45;
      }

      setProfileData(mockProfile);
      setIsLoading(false);
    };

    // Simular delay de carga
    setTimeout(loadProfile, 1500);
  }, [router]);

  const handleLoanRequest = async (loanData: { amount: number; walletAddress: string }) => {
    setIsProcessingLoan(true);

    try {
      // Simular llamada al backend para procesar el préstamo
      console.log('Procesando préstamo:', loanData);
      
      // Simular delay de procesamiento del smart contract
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Simular hash de transacción
      const mockTxHash = `${Date.now().toString(16)}abcdef123456789`;

      // Redirigir a página de éxito con datos reales
      router.push(`/success?amount=${loanData.amount}&hash=${mockTxHash}&wallet=${loanData.walletAddress}`);

    } catch (error) {
      console.error('Error procesando préstamo:', error);
      alert('Error procesando el préstamo: ' + error);
      setIsProcessingLoan(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Analizando Perfil Crediticio...
          </h3>
          <p className="text-gray-600">
            Procesando datos de ingresos y calculando elegibilidad
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error cargando perfil
          </h2>
          <p className="text-gray-600 mb-6">
            No se pudo cargar la información de tu perfil crediticio
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Regresar al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="bg-white shadow-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Perfil Crediticio
              </h1>
              <p className="text-gray-600 mt-1">
                Wallet: <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {formatAddress(profileData.walletAddress)}
                </code>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Estado del análisis</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Completado</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreditProfile 
          data={profileData}
          onLoanRequest={handleLoanRequest}
          isProcessing={isProcessingLoan}
        />

        {/* Actions Footer */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver al Dashboard
          </button>
          {profileData.eligibility === 'rejected' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mejorar Perfil
            </button>
          )}
        </div>
      </main>

      {/* Loading Overlay durante procesamiento */}
      {isProcessingLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Procesando Préstamo...
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>🔐 Ejecutando smart contract en Stellar Soroban</p>
              <p>💰 Transfiriendo fondos a tu wallet</p>
              <p>📝 Registrando transacción en blockchain</p>
            </div>
            <div className="mt-4 text-sm text-blue-600">
              Por favor espera, esto puede tomar unos segundos...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}