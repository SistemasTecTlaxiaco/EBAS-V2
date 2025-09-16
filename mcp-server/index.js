#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class SorobanMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'soroban-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'soroban_build',
            description: 'Build Soroban smart contracts',
            inputSchema: {
              type: 'object',
              properties: {
                contract_path: {
                  type: 'string',
                  description: 'Path to the contract directory (optional, defaults to current directory)',
                },
              },
            },
          },
          {
            name: 'soroban_test',
            description: 'Run tests for Soroban smart contracts',
            inputSchema: {
              type: 'object',
              properties: {
                contract_path: {
                  type: 'string',
                  description: 'Path to the contract directory (optional, defaults to current directory)',
                },
              },
            },
          },
          {
            name: 'soroban_deploy',
            description: 'Deploy Soroban smart contract to network',
            inputSchema: {
              type: 'object',
              properties: {
                contract_path: {
                  type: 'string',
                  description: 'Path to the contract WASM file',
                },
                network: {
                  type: 'string',
                  description: 'Network to deploy to (testnet, futurenet, or mainnet)',
                  enum: ['testnet', 'futurenet', 'mainnet'],
                },
                source: {
                  type: 'string',
                  description: 'Source account for deployment',
                },
              },
              required: ['contract_path', 'network', 'source'],
            },
          },
          {
            name: 'soroban_invoke',
            description: 'Invoke a function on a deployed Soroban contract',
            inputSchema: {
              type: 'object',
              properties: {
                contract_id: {
                  type: 'string',
                  description: 'Contract ID to invoke',
                },
                function_name: {
                  type: 'string',
                  description: 'Function name to call',
                },
                args: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Function arguments',
                },
                network: {
                  type: 'string',
                  description: 'Network to use',
                  enum: ['testnet', 'futurenet', 'mainnet'],
                },
                source: {
                  type: 'string',
                  description: 'Source account for transaction',
                },
              },
              required: ['contract_id', 'function_name', 'network', 'source'],
            },
          },
          {
            name: 'stellar_account_info',
            description: 'Get account information from Stellar network',
            inputSchema: {
              type: 'object',
              properties: {
                account_id: {
                  type: 'string',
                  description: 'Stellar account ID to query',
                },
                network: {
                  type: 'string',
                  description: 'Network to query',
                  enum: ['testnet', 'futurenet', 'mainnet'],
                },
              },
              required: ['account_id', 'network'],
            },
          },
          {
            name: 'generate_keypair',
            description: 'Generate a new Stellar keypair',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_contracts',
            description: 'List all contracts in the workspace',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'soroban_build':
            return await this.buildContract(args.contract_path);
          
          case 'soroban_test':
            return await this.testContract(args.contract_path);
          
          case 'soroban_deploy':
            return await this.deployContract(args.contract_path, args.network, args.source);
          
          case 'soroban_invoke':
            return await this.invokeContract(
              args.contract_id,
              args.function_name,
              args.args || [],
              args.network,
              args.source
            );
          
          case 'stellar_account_info':
            return await this.getAccountInfo(args.account_id, args.network);
          
          case 'generate_keypair':
            return await this.generateKeypair();
          
          case 'list_contracts':
            return await this.listContracts();
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async buildContract(contractPath = '.') {
    try {
      const { stdout, stderr } = await execAsync('stellar contract build', {
        cwd: contractPath,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Build successful:\n${stdout}${stderr ? `\nWarnings/Errors:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async testContract(contractPath = '.') {
    try {
      const { stdout, stderr } = await execAsync('cargo test', {
        cwd: contractPath,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Tests completed:\n${stdout}${stderr ? `\nWarnings/Errors:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`);
    }
  }

  async deployContract(contractPath, network, source) {
    try {
      const cmd = `stellar contract deploy --wasm ${contractPath} --source ${source} --network ${network}`;
      const { stdout, stderr } = await execAsync(cmd);
      
      return {
        content: [
          {
            type: 'text',
            text: `Deployment successful:\n${stdout}${stderr ? `\nWarnings:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async invokeContract(contractId, functionName, args, network, source) {
    try {
      const argsStr = args.length > 0 ? `-- ${args.join(' ')}` : '';
      const cmd = `stellar contract invoke --id ${contractId} --source ${source} --network ${network} -- ${functionName} ${argsStr}`;
      const { stdout, stderr } = await execAsync(cmd);
      
      return {
        content: [
          {
            type: 'text',
            text: `Invocation result:\n${stdout}${stderr ? `\nWarnings:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Invocation failed: ${error.message}`);
    }
  }

  async getAccountInfo(accountId, network) {
    try {
      const cmd = `stellar keys address ${accountId}`;
      const { stdout } = await execAsync(cmd);
      
      return {
        content: [
          {
            type: 'text',
            text: `Account information:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  async generateKeypair() {
    try {
      const { stdout } = await execAsync('stellar keys generate --global test-keypair --network testnet');
      
      return {
        content: [
          {
            type: 'text',
            text: `New keypair generated:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate keypair: ${error.message}`);
    }
  }

  async listContracts() {
    try {
      const contractsDir = './contracts';
      const entries = await fs.readdir(contractsDir, { withFileTypes: true });
      const contracts = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
      
      return {
        content: [
          {
            type: 'text',
            text: `Available contracts:\n${contracts.map(c => `- ${c}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list contracts: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Soroban MCP Server running on stdio');
  }
}

const server = new SorobanMCPServer();
server.run().catch(console.error);