'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipos según especificaciones MVP
interface CreditProfileData {
  walletAddress: string;
  eligibility: 'approved' | 'rejected';
  creditScore: number; // Interno, NO visible al cliente según MVP
  loanAmount?: number;
  weeklyAverage: number;
  totalEarnings: number;
  connectedPlatforms: number;
  consistencyScore: number; // 0-100
  platformsData: {
    platform: string;
    earnings: number;
    icon: string;
  }[];
  terms: {
    interestRate: number;
    repaymentPeriod: number;
    processingFee: number;
  };
}

interface CreditProfileProps {
  data: CreditProfileData;
  onLoanRequest?: (loanData: { amount: number; walletAddress: string }) => void;
  isProcessing?: boolean;
}

export function CreditProfile({ data, onLoanRequest, isProcessing = false }: CreditProfileProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();

  const handleRequestLoan = () => {
    if (data.eligibility !== 'approved' || !data.loanAmount) return;
    setShowTermsModal(true);
  };

  const handleConfirmLoan = () => {
    if (!data.loanAmount) return;
    
    setShowTermsModal(false);
    onLoanRequest?.({
      amount: data.loanAmount,
      walletAddress: data.walletAddress
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEligibilityColor = (eligibility: string) => {
    return eligibility === 'approved' ? 'green' : 'red';
  };

  const getConsistencyBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'green' };
    if (score >= 60) return { label: 'Buena', color: 'blue' };
    if (score >= 40) return { label: 'Regular', color: 'yellow' };
    return { label: 'Baja', color: 'red' };
  };

  const consistency = getConsistencyBadge(data.consistencyScore);
  const color = getEligibilityColor(data.eligibility);

  return (
    <div className="space-y-6">
      {/* Estado de Elegibilidad - Card Principal */}
      <div className={`rounded-xl shadow-lg p-8 border-2 ${
        data.eligibility === 'approved'
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`text-5xl ${data.eligibility === 'approved' ? '✅' : '❌'}`}></div>
              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  data.eligibility === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {data.eligibility === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                </div>
                <h2 className={`text-3xl font-bold mt-2 ${
                  data.eligibility === 'approved' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {data.eligibility === 'approved' 
                    ? 'Préstamo Pre-aprobado' 
                    : 'Préstamo No Disponible'
                  }
                </h2>
              </div>
            </div>

            {/* Monto Disponible */}
            {data.eligibility === 'approved' && data.loanAmount && (
              <div className="mb-6">
                <p className="text-green-700 text-lg mb-2">Monto disponible:</p>
                <div className="text-5xl font-bold text-green-800 mb-2">
                  {formatCurrency(data.loanAmount)}
                </div>
                <p className="text-green-600">
                  Basado en tu promedio semanal de {formatCurrency(data.weeklyAverage)}
                </p>
              </div>
            )}

            {/* Mensaje de Rechazo */}
            {data.eligibility === 'rejected' && (
              <div className="mb-6">
                <p className="text-red-700 text-lg mb-2">
                  Actualmente no cumples con los requisitos mínimos.
                </p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Para mejorar tu elegibilidad:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Mantén un promedio semanal ≥ $400 USD</li>
                    <li>• Conecta más plataformas de gig economy</li>
                    <li>• Incrementa tu consistencia en los ingresos</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Solicitud */}
          {data.eligibility === 'approved' && (
            <div className="ml-8">
              <button
                onClick={handleRequestLoan}
                disabled={isProcessing}
                className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-105 shadow-lg ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </div>
                ) : (
                  'Solicitar Préstamo'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Métricas del Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(data.totalEarnings)}
          </div>
          <div className="text-gray-700 font-medium">Ingresos Totales</div>
          <div className="text-sm text-gray-500">(últimas 4 semanas)</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-green-100">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(data.weeklyAverage)}
          </div>
          <div className="text-gray-700 font-medium">Promedio Semanal</div>
          <div className={`text-sm inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${consistency.color}-100 text-${consistency.color}-700`}>
            <div className={`w-2 h-2 rounded-full bg-${consistency.color}-500`}></div>
            {consistency.label}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-purple-100">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {data.connectedPlatforms}
          </div>
          <div className="text-gray-700 font-medium">Plataformas</div>
          <div className="text-sm text-gray-500">Conectadas</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-indigo-100">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {data.consistencyScore}%
          </div>
          <div className="text-gray-700 font-medium">Consistencia</div>
          <div className="text-sm text-gray-500">Score interno</div>
        </div>
      </div>

      {/* Desglose por Plataformas */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📱 Plataformas Conectadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.platformsData.map((platform, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 capitalize">{platform.platform}</div>
                  <div className="text-sm text-gray-600">Últimas 4 semanas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(platform.earnings)}
                </div>
                <div className="text-sm text-gray-500">
                  {((platform.earnings / data.totalEarnings) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Términos del Préstamo */}
      {data.eligibility === 'approved' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📋 Términos del Préstamo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {data.terms.interestRate}%
              </div>
              <div className="text-sm text-blue-600 font-medium">Tasa Anual</div>
              <div className="text-xs text-blue-500">Competitiva</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {data.terms.repaymentPeriod}
              </div>
              <div className="text-sm text-green-600 font-medium">Días para Pagar</div>
              <div className="text-xs text-green-500">Flexible</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {formatCurrency(data.terms.processingFee)}
              </div>
              <div className="text-sm text-purple-600 font-medium">Comisión</div>
              <div className="text-xs text-purple-500">Una sola vez</div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Seguridad */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          🔐 Información de Seguridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span className="text-blue-800">Smart contract verificable en Stellar Soroban</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span className="text-blue-800">Transferencia automática a tu wallet</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span className="text-blue-800">Datos encriptados y seguros</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span className="text-blue-800">Sin intermediarios, 100% descentralizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Confirmar Solicitud de Préstamo
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Resumen del Préstamo */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">💰 Resumen del Préstamo</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700">Monto solicitado:</span>
                      <span className="font-bold text-green-800">
                        {data.loanAmount && formatCurrency(data.loanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Comisión de procesamiento:</span>
                      <span className="font-bold text-green-800">
                        {formatCurrency(data.terms.processingFee)}
                      </span>
                    </div>
                    <hr className="border-green-200 my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="text-green-800 font-semibold">Total a recibir:</span>
                      <span className="font-bold text-green-900">
                        {data.loanAmount && formatCurrency(data.loanAmount - data.terms.processingFee)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Términos Detallados */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">📋 Términos y Condiciones:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Tasa de interés:</strong> {data.terms.interestRate}% anual</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Período de repago:</strong> {data.terms.repaymentPeriod} días corridos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Método de pago:</strong> La transferencia se ejecuta automáticamente vía smart contract de Soroban</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Tiempo de procesamiento:</strong> Los fondos llegarán a tu wallet en 1-3 minutos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Red:</strong> Stellar Testnet (para demo)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Advertencia Importante */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 text-xl">⚠️</span>
                    <div>
                      <p className="text-amber-800 font-semibold mb-2">Importante:</p>
                      <p className="text-amber-700 text-sm">
                        Al confirmar, se ejecutará automáticamente el smart contract de Stellar Soroban 
                        para transferir los fondos a tu wallet. <strong>Esta acción no puede revertirse.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLoan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg"
                >
                  Confirmar y Solicitar Préstamo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}