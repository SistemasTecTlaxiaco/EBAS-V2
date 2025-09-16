// types/freighter.d.ts
declare global {
  interface Window {
    freighterApi: {
      isConnected(): Promise<boolean>;
      getPublicKey(): Promise<string>;
      signTransaction(transaction: string, options?: {
        network?: string;
        networkPassphrase?: string;
        accountToSign?: string;
      }): Promise<string>;
      signAuthEntry(
        entryXdr: string,
        options?: { accountToSign?: string }
      ): Promise<string>;
      requestAccess(): Promise<void>;
      setAllowed(): Promise<void>;
      isAllowed(): Promise<boolean>;
      getUserInfo(): Promise<{
        publicKey: string;
      }>;
    };
  }
}

export interface FreighterModule {
  isConnected(): Promise<boolean>;
  getPublicKey(): Promise<string>;
  signTransaction(transaction: string, options?: {
    network?: string;
    networkPassphrase?: string;
    accountToSign?: string;
  }): Promise<string>;
  requestAccess(): Promise<void>;
  isAllowed(): Promise<boolean>;
  getUserInfo(): Promise<{
    publicKey: string;
  }>;
}

export {};