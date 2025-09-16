'use client';

import { useState, useEffect } from 'react';
import { useStellar } from '@/contexts/StellarContext';
import { useFreighter } from '@/hooks/useFreighter';
import { NETWORKS } from '@/lib/stellar';

// Importar métodos oficiales de Freighter API
import { 
  isConnected as freighterIsConnected, 
  requestAccess as freighterRequestAccess, 
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  getNetworkDetails as freighterGetNetworkDetails,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  signTransaction as freighterSignTransaction,
  signMessage as freighterSignMessage,
  addToken as freighterAddToken,
  WatchWalletChanges
} from '@stellar/freighter-api';

export default function WalletConnection() {
  const {
    isConnected: stellarConnected,
    account,
    network,
    balance,
    loading: stellarLoading,
    error: stellarError,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useStellar();

  const {
    wallet: freighterWallet,
    loading: freighterLoading,
    error: freighterError,
    connect: connectFreighter,
    disconnect: disconnectFreighter,
    switchNetwork: switchFreighterNetwork,
    isInstalled,
    getInstallUrl,
    getErrorMessage,
  } = useFreighter();

  const [selectedWallet, setSelectedWallet] = useState<'freighter' | 'albedo' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    freighterInstalled: boolean;
    freighterConnected: boolean;
    freighterAllowed: boolean;
    currentNetwork: string;
    networkDetails: {
      network: string;
      networkUrl: string;
      networkPassphrase: string;
      sorobanRpcUrl?: string;
    } | null;
    checking: boolean;
  }>({
    freighterInstalled: false,
    freighterConnected: false,
    freighterAllowed: false,
    currentNetwork: 'unknown',
    networkDetails: null,
    checking: true,
  });

  // Verificar estado de Freighter al cargar
  useEffect(() => {
    const checkFreighterStatus = async () => {
      try {
        setConnectionStatus(prev => ({ ...prev, checking: true }));
        
        // Verificar si Freighter está instalado y conectado
        const connected = await freighterIsConnected();
        const installed = isInstalled;
        
        // Verificar si la aplicación está permitida
        let allowed = false;
        let currentNet = 'unknown';
        let netDetails = null;
        
        if (connected.isConnected && !connected.error) {
          try {
            const allowedStatus = await freighterIsAllowed();
            allowed = allowedStatus.isAllowed || false;
            
            // Obtener información de la red actual
            const networkInfo = await freighterGetNetwork();
            if (networkInfo && !networkInfo.error) {
              currentNet = networkInfo.network || 'unknown';
            }
            
            // Obtener detalles de la red
            const networkDetailsInfo = await freighterGetNetworkDetails();
            if (networkDetailsInfo && !networkDetailsInfo.error) {
              netDetails = networkDetailsInfo;
            }
          } catch (error) {
            console.warn('Error checking Freighter permissions or network:', error);
          }
        }
        
        setConnectionStatus({
          freighterInstalled: installed,
          freighterConnected: connected.isConnected && !connected.error,
          freighterAllowed: allowed,
          currentNetwork: currentNet,
          networkDetails: netDetails,
          checking: false,
        });
      } catch (error) {
        console.error('Error checking Freighter status:', error);
        setConnectionStatus({
          freighterInstalled: false,
          freighterConnected: false,
          freighterAllowed: false,
          currentNetwork: 'unknown',
          networkDetails: null,
          checking: false,
        });
      }
    };

    checkFreighterStatus();
    
    // Configurar observador de cambios en la wallet
    const watchChanges = WatchWalletChanges((walletInfo) => {
      console.log('Wallet changes detected:', walletInfo);
      // Actualizar estado cuando hay cambios en la wallet
      checkFreighterStatus();
    });

    // Cleanup function
    return () => {
      if (typeof watchChanges === 'function') {
        watchChanges();
      }
    };
  }, [isInstalled]);

  const isConnected = stellarConnected || freighterWallet.isConnected || connectionStatus.freighterConnected;
  const loading = stellarLoading || freighterLoading || connectionStatus.checking;
  const error = stellarError || (freighterError ? getErrorMessage(freighterError) : null);

  const handleFreighterConnect = async () => {
    setSelectedWallet('freighter');
    
    try {
      // Primero verificar si ya está permitido
      const allowedStatus = await freighterIsAllowed();
      
      if (!allowedStatus.isAllowed) {
        // Si no está permitido, solicitar acceso
        const accessResult = await freighterRequestAccess();
        
        if (accessResult.error) {
          console.error('Freighter access error:', accessResult.error);
          return;
        }

        if (accessResult.address) {
          // Éxito - configurar como permitido
          await freighterSetAllowed();
        }
      }
      
      // Obtener dirección actual
      const addressResult = await freighterGetAddress();
      if (addressResult.error) {
        console.error('Error getting Freighter address:', addressResult.error);
        return;
      }

      // Obtener información de la red
      const networkInfo = await freighterGetNetwork();
      const networkDetails = await freighterGetNetworkDetails();
      
      // Actualizar estados
      setConnectionStatus(prev => ({ 
        ...prev, 
        freighterConnected: true,
        freighterAllowed: true,
        currentNetwork: networkInfo.network || 'unknown',
        networkDetails: networkDetails || null
      }));
      
      // Conectar también con el hook useFreighter
      const freighterSuccess = await connectFreighter();
      
      // Sincronizar con contexto Stellar si es necesario
      if (freighterSuccess || addressResult.address) {
        connectWallet();
      }
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    disconnectFreighter();
    setSelectedWallet(null);
    setConnectionStatus(prev => ({ 
      ...prev, 
      freighterConnected: false,
      freighterAllowed: false,
      currentNetwork: 'unknown',
      networkDetails: null
    }));
  };

  const handleNetworkChange = (newNetwork: keyof typeof NETWORKS) => {
    switchNetwork(newNetwork);
    switchFreighterNetwork(newNetwork);
  };

  // Funciones adicionales para trabajar con Freighter
  const signTransactionWithFreighter = async (xdr: string, opts?: {
    networkPassphrase?: string;
    address?: string;
  }) => {
    try {
      const result = await freighterSignTransaction(xdr, opts);
      if (result.error) {
        throw new Error(result.error.message || result.error.toString());
      }
      return result;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  const signMessageWithFreighter = async (message: string, opts: { address: string }) => {
    try {
      const result = await freighterSignMessage(message, opts);
      if (result.error) {
        throw new Error(result.error.message || result.error.toString());
      }
      return result;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  const addTokenToFreighter = async (tokenParams: {
    address: string;
    network?: string;
  }) => {
    try {
      const result = await freighterAddToken(tokenParams.address, tokenParams.network);
      if (result.error) {
        throw new Error(result.error.message || result.error.toString());
      }
      return result;
    } catch (error) {
      console.error('Error adding token:', error);
      throw error;
    }
  };

  const currentPublicKey = account?.publicKey || freighterWallet.publicKey;
  const currentNetwork = network || freighterWallet.network;

  if (loading && connectionStatus.checking) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Verificando wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
        Wallet Connection
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Connection Error</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              {freighterError?.code === 'FREIGHTER_NOT_INSTALLED' && (
                <a
                  href={getInstallUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Install Freighter Wallet
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-center mb-6">
            Choose your preferred Stellar wallet to get started
          </p>

          {/* Freighter Wallet Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Freighter</h3>
                  <p className="text-sm text-gray-500">
                    {connectionStatus.freighterInstalled 
                      ? 'Browser extension detected' 
                      : 'Browser extension required'}
                  </p>
                </div>
              </div>
              {connectionStatus.freighterInstalled ? (
                <button
                  onClick={handleFreighterConnect}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {loading && selectedWallet === 'freighter' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              ) : (
                <a
                  href={getInstallUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
                >
                  Install Freighter
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-700 mb-2">Connection Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus.freighterInstalled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-600">
                  Freighter Extension: {connectionStatus.freighterInstalled ? 'Installed' : 'Not Installed'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus.freighterConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600">
                  Connection: {connectionStatus.freighterConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus.freighterAllowed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-gray-600">
                  Permission: {connectionStatus.freighterAllowed ? 'Granted' : 'Pending'}
                </span>
              </div>
              {connectionStatus.currentNetwork !== 'unknown' && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2 bg-blue-400"></div>
                  <span className="text-gray-600">
                    Network: {connectionStatus.currentNetwork.charAt(0).toUpperCase() + connectionStatus.currentNetwork.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Albedo Wallet Option (Coming Soon) */}
          <div className="border border-gray-200 rounded-lg p-4 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Albedo</h3>
                  <p className="text-sm text-gray-500">Web-based wallet (Coming soon)</p>
                </div>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network
            </label>
            <select
              value={currentNetwork}
              onChange={(e) => handleNetworkChange(e.target.value as keyof typeof NETWORKS)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.keys(NETWORKS).map((net) => (
                <option key={net} value={net}>
                  {net.charAt(0).toUpperCase() + net.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Account Information */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium mb-3 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Connected Account
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Public Key</label>
                <div className="mt-1 p-2 bg-white rounded border">
                  <code className="text-xs font-mono break-all text-gray-800">
                    {currentPublicKey}
                  </code>
                </div>
              </div>
              
              {balance && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">XLM Balance</label>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {parseFloat(balance).toFixed(4)} XLM
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Connected via Freighter on {connectionStatus.currentNetwork !== 'unknown' ? connectionStatus.currentNetwork : currentNetwork}
              </div>

              {connectionStatus.networkDetails && (
                <div className="mt-2 p-2 bg-blue-50 rounded border">
                  <h4 className="text-xs font-medium text-blue-800 mb-1">Network Details</h4>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>Passphrase: {connectionStatus.networkDetails.networkPassphrase}</div>
                    <div>URL: {connectionStatus.networkDetails.networkUrl}</div>
                    {connectionStatus.networkDetails.sorobanRpcUrl && (
                      <div>Soroban RPC: {connectionStatus.networkDetails.sorobanRpcUrl}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-3 text-blue-800">Advanced Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  try {
                    if (!currentPublicKey) {
                      alert('No public key available');
                      return;
                    }
                    const message = "Hello from Lana DeFi!";
                    const result = await signMessageWithFreighter(message, { address: currentPublicKey });
                    alert(`Message signed successfully! Signature: ${result.signedMessage}`);
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    alert(`Error: ${errorMessage}`);
                  }
                }}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                Sign Message
              </button>
              <button
                onClick={async () => {
                  const contractAddress = prompt("Enter Stellar Asset Contract Address:");
                  if (contractAddress) {
                    try {
                      await addTokenToFreighter({ 
                        address: contractAddress,
                        network: connectionStatus.currentNetwork 
                      });
                      alert("Token added successfully!");
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                      alert(`Error adding token: ${errorMessage}`);
                    }
                  }
                }}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
              >
                Add Token
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              Disconnect Wallet
            </button>
            <button
              onClick={() => window.open(`https://stellar.expert/explorer/${connectionStatus.currentNetwork !== 'unknown' ? connectionStatus.currentNetwork : currentNetwork}/account/${currentPublicKey}`, '_blank')}
              className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}