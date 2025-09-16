'use client';

import { useState, useEffect } from 'react';
import { useStellar } from '@/contexts/StellarContext';

interface Contract {
  name: string;
  path: string;
  built: boolean;
}

export default function ContractManager() {
  const { isConnected, network } = useStellar();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [buildingContract, setBuildingContract] = useState('');
  const [deployingContract, setDeployingContract] = useState('');
  const [buildResult, setBuildResult] = useState('');
  const [deployResult, setDeployResult] = useState('');
  const [error, setError] = useState('');

  // Cargar lista de contratos
  const loadContracts = async () => {
    setLoading(true);
    try {
      // Simular carga de contratos (aquí conectarías con tu MCP server)
      const mockContracts = [
        { name: 'hello-world', path: './contracts/hello-world', built: true },
        { name: 'token-example', path: './contracts/token', built: false },
      ];
      setContracts(mockContracts);
      
      // TODO: Conectar con MCP server
      // const response = await fetch('/api/list-contracts');
      // const data = await response.json();
      // setContracts(data.contracts);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const buildContract = async (contractName: string) => {
    setBuildingContract(contractName);
    setBuildResult('');
    setError('');

    try {
      // Simular build del contrato
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de build
      
      const mockResult = `Building contract: ${contractName}\n✓ Compiled successfully\n✓ WASM file generated\n✓ Optimized for deployment`;
      setBuildResult(mockResult);
      
      // Actualizar estado del contrato
      setContracts(prev => 
        prev.map(contract => 
          contract.name === contractName 
            ? { ...contract, built: true }
            : contract
        )
      );

      // TODO: Conectar con MCP server
      // const response = await fetch('/api/build-contract', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ contractName }),
      // });
      // const result = await response.json();
      // setBuildResult(result.output);

    } catch (err: any) {
      setError(`Failed to build ${contractName}: ${err.message}`);
    } finally {
      setBuildingContract('');
    }
  };

  const deployContract = async (contractName: string) => {
    if (!isConnected) {
      setError('Please connect your wallet to deploy contracts');
      return;
    }

    setDeployingContract(contractName);
    setDeployResult('');
    setError('');

    try {
      // Simular deploy del contrato
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simular tiempo de deploy
      
      const mockContractId = `C${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const mockResult = `Deploying ${contractName} to ${network}\n✓ Transaction submitted\n✓ Contract deployed\n✓ Contract ID: ${mockContractId}`;
      setDeployResult(mockResult);

      // TODO: Conectar con MCP server
      // const response = await fetch('/api/deploy-contract', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     contractName,
      //     network,
      //   }),
      // });
      // const result = await response.json();
      // setDeployResult(result.output);

    } catch (err: any) {
      setError(`Failed to deploy ${contractName}: ${err.message}`);
    } finally {
      setDeployingContract('');
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Contract Manager</h2>
        <button
          onClick={loadContracts}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {contracts.length === 0 ? (
        <p className="text-gray-600">No contracts found in the workspace</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.name}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{contract.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    contract.built
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {contract.built ? 'Built' : 'Not Built'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{contract.path}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => buildContract(contract.name)}
                  disabled={buildingContract === contract.name}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  {buildingContract === contract.name ? 'Building...' : 'Build'}
                </button>
                
                <button
                  onClick={() => deployContract(contract.name)}
                  disabled={
                    !contract.built ||
                    !isConnected ||
                    deployingContract === contract.name
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {deployingContract === contract.name ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {buildResult && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Build Result</h3>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
            {buildResult}
          </pre>
        </div>
      )}

      {deployResult && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Deploy Result</h3>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
            {deployResult}
          </pre>
        </div>
      )}
    </div>
  );
}