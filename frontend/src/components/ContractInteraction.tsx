'use client';

import { useState } from 'react';
import { useStellar } from '@/contexts/StellarContext';

export default function ContractInteraction() {
  const { client, account, isConnected, network } = useStellar();
  const [contractId, setContractId] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [functionArgs, setFunctionArgs] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const invokeContract = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      // Parse arguments
      let args: string[] = [];
      if (functionArgs.trim()) {
        args = functionArgs.split(',').map(arg => arg.trim());
      }

      // Simular invocación del contrato (aquí conectarías con tu MCP server)
      const mockResult = {
        success: true,
        result: `Called ${functionName} on contract ${contractId} with args: [${args.join(', ')}]`,
        transactionId: 'mock-tx-' + Date.now(),
      };

      setResult(JSON.stringify(mockResult, null, 2));
      
      // TODO: Aquí harías la llamada real al MCP server
      // const response = await fetch('/api/invoke-contract', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     contractId,
      //     functionName,
      //     args,
      //     network,
      //     source: account.publicKey,
      //   }),
      // });
      // const result = await response.json();
      // setResult(JSON.stringify(result, null, 2));

    } catch (err: any) {
      setError(err.message || 'Failed to invoke contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Contract Interaction</h2>

      {!isConnected && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Please connect your wallet to interact with contracts
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract ID
          </label>
          <input
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Enter contract ID"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={!isConnected}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Function Name
          </label>
          <input
            type="text"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            placeholder="Enter function name (e.g., hello)"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={!isConnected}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Function Arguments
          </label>
          <input
            type="text"
            value={functionArgs}
            onChange={(e) => setFunctionArgs(e.target.value)}
            placeholder="Enter arguments separated by commas (e.g., World, 123)"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={!isConnected}
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple arguments with commas
          </p>
        </div>

        <button
          onClick={invokeContract}
          disabled={!isConnected || loading || !contractId || !functionName}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Invoking Contract...' : 'Invoke Contract'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}