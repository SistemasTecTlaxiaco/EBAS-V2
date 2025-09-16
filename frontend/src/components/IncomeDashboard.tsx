'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipos según las especificaciones del MVP
interface WeeklyEarning {
  week: string; // ISO format
  amount: number;
  currency: 'USD';
  trips: number;
}

interface PlatformData {
  platform: 'uber' | 'rappi' | 'didi' | 'deliveroo';
  earnings: WeeklyEarning[];
  rating: number;
  tripsCount: number;
}

interface LoanDataResponse {
  user: {
    walletAddress: string;
    platforms: PlatformData[];
    totalEarnings: number;
    weeklyAverage: number;
    eligibility: 'approved' | 'rejected';
    loanAmount?: number;
  };
}

type DashboardState = 'initial' | 'processing' | 'completed';

const MOCK_PLATFORMS = ['uber', 'rappi', 'didi', 'deliveroo'] as const;

export function IncomeDashboard() {
  const [state, setState] = useState<DashboardState>('initial');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loanData, setLoanData] = useState<LoanDataResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleConnectApps = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Por favor selecciona al menos una plataforma');
      return;
    }

    setState('processing');
    setProgress(0);

    // Simular proceso de análisis con progress bar
    const steps = [
      { message: 'Conectando con APIs...', duration: 1000, progress: 25 },
      { message: 'Analizando historial de ingresos...', duration: 1500, progress: 50 },
      { message: 'Calculando perfil crediticio...', duration: 1200, progress: 75 },
      { message: 'Generando reporte...', duration: 800, progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => {
        setTimeout(() => {
          setProgress(step.progress);
          resolve(void 0);
        }, step.duration);
      });
    }

    // Simular datos de respuesta según el MVP
    const mockData: LoanDataResponse = {
      user: {
        walletAddress: localStorage.getItem('wallet_publicKey') || '',
        platforms: selectedPlatforms.map(platform => ({
          platform: platform as any,
          earnings: [
            { week: '2025-08-19', amount: 450, currency: 'USD', trips: 32 },
            { week: '2025-08-26', amount: 520, currency: 'USD', trips: 38 },
            { week: '2025-09-02', amount: 380, currency: 'USD', trips: 28 },
            { week: '2025-09-09', amount: 490, currency: 'USD', trips: 35 }
          ],
          rating: 4.8,
          tripsCount: 133
        })),
        totalEarnings: 1840,
        weeklyAverage: 460,
        eligibility: 'approved', // Según lógica del MVP: >$400 promedio
        loanAmount: 230 // 50% del promedio semanal
      }
    };

    setLoanData(mockData);
    setState('completed');
  };

  const handleRequestLoan = () => {
    // Navegar al perfil crediticio
    router.push('/profile');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      uber: '🚗',
      rappi: '🛵',
      didi: '🚙',
      deliveroo: '🍔'
    };
    return icons[platform as keyof typeof icons] || '📱';
  };

  const getPlatformName = (platform: string) => {
    const names = {
      uber: 'Uber',
      rappi: 'Rappi',
      didi: 'DiDi',
      deliveroo: 'Deliveroo'
    };
    return names[platform as keyof typeof names] || platform;
  };

  if (state === 'initial') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Genera tu Perfil Crediticio
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conecta tus aplicaciones de trabajo para generar automáticamente 
              tu historial de ingresos y acceder a préstamos personalizados.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selecciona tus plataformas de trabajo:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MOCK_PLATFORMS.map(platform => (
                <button
                  key={platform}
                  onClick={() => handlePlatformToggle(platform)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPlatforms.includes(platform)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {getPlatformIcon(platform)}
                  </div>
                  <div className="font-semibold text-sm">
                    {getPlatformName(platform)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleConnectApps}
              disabled={selectedPlatforms.length === 0}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                selectedPlatforms.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Conecta tus Apps y Genera tu Historial
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analizando tu historial...
            </h2>
            <p className="text-gray-600">
              Estamos procesando tus datos de ingresos de forma segura
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {progress}% completado
            </div>
          </div>

          <div className="text-sm text-gray-500">
            🔒 Tus datos están encriptados y se procesan de forma segura
          </div>
        </div>
      </div>
    );
  }

  if (state === 'completed' && loanData) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header de resultados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                ✅ Perfil Crediticio Generado
              </h2>
              <p className="text-gray-600">
                Basado en {loanData.user.platforms.length} plataforma(s) conectada(s)
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              loanData.user.eligibility === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {loanData.user.eligibility === 'approved' ? 'Elegible' : 'No Elegible'}
            </div>
          </div>

          {loanData.user.eligibility === 'approved' && loanData.user.loanAmount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900">
                    Préstamo Disponible
                  </h3>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(loanData.user.loanAmount)}
                  </p>
                </div>
                <button
                  onClick={handleRequestLoan}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Solicitar Préstamo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de ingresos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(loanData.user.totalEarnings)}
            </div>
            <div className="text-gray-600">Ingresos Totales</div>
            <div className="text-sm text-gray-500">(últimas 4 semanas)</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(loanData.user.weeklyAverage)}
            </div>
            <div className="text-gray-600">Promedio Semanal</div>
            <div className="text-sm text-gray-500">Consistencia alta</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {loanData.user.platforms.length}
            </div>
            <div className="text-gray-600">Plataformas</div>
            <div className="text-sm text-gray-500">Conectadas</div>
          </div>
        </div>

        {/* Cards de plataformas conectadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loanData.user.platforms.map(platform => (
            <div key={platform.platform} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">
                  {getPlatformIcon(platform.platform)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {getPlatformName(platform.platform)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600">
                      {platform.rating} • {platform.tripsCount} viajes
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {platform.earnings.map((earning, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="text-sm text-gray-600">
                      Semana {new Date(earning.week).toLocaleDateString()}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(earning.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {earning.trips} viajes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botón para volver */}
        <div className="text-center">
          <button
            onClick={() => {
              setState('initial');
              setSelectedPlatforms([]);
              setLoanData(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Analizar otras plataformas
          </button>
        </div>
      </div>
    );
  }

  return null;
}