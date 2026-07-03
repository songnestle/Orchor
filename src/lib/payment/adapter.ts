export interface Asset {
  symbol: string;
  decimals: number;
  contractAddress?: string;
}

export interface DepositAddress {
  address: string;
  memo?: string;
  qrCode: string;
  expiresAt?: Date;
}

export interface TransactionStatus {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  amount: bigint;
  asset: string;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber?: number;
}

export interface WithdrawParams {
  userId: string;
  asset: string;
  amount: bigint;
  destination: string;
  memo?: string;
}

export interface WithdrawResult {
  txHash: string;
  estimatedConfirmationTime: number;
  actualFee: bigint;
}

export interface FeeEstimate {
  fee: bigint;
  feeAsset: string;
  estimatedTime: number;
}

export abstract class ChainAdapter {
  abstract chainId: string;
  abstract chainName: string;
  abstract supportedAssets: Asset[];

  // Deposit flow
  abstract createDepositAddress(userId: string): Promise<DepositAddress>;
  abstract verifyTransaction(txHash: string): Promise<TransactionStatus>;
  abstract getTransactionStatus(txHash: string): Promise<TransactionStatus>;

  // Withdrawal flow
  abstract withdraw(params: WithdrawParams): Promise<WithdrawResult>;
  abstract estimateFee(asset: string, amount: bigint): Promise<FeeEstimate>;

  // Health checks
  abstract getBalance(address: string, asset: string): Promise<bigint>;
  abstract isHealthy(): Promise<boolean>;

  // Utilities
  abstract validateAddress(address: string): boolean;
  abstract formatAmount(amount: bigint, asset: string): string;
  abstract parseAmount(amount: string, asset: string): bigint;

  // Helper for QR code generation
  protected async generateQRCode(data: string): Promise<string> {
    // For now return a data URL placeholder
    // In production, use a QR code library like 'qrcode'
    return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><text>${data}</text></svg>`).toString('base64')}`;
  }
}
