import { ChainAdapter, Asset, DepositAddress, TransactionStatus, WithdrawParams, WithdrawResult, FeeEstimate } from './adapter';

/**
 * EVM Adapter - Mock implementation for Phase 1
 * Supports Monad, Base, Ethereum, etc.
 * Will be replaced with real viem integration in Phase 4
 */
export class EVMAdapter extends ChainAdapter {
  chainId: string;
  chainName: string;
  supportedAssets: Asset[];

  private depositAddress: string;

  constructor(config: {
    chainId: number;
    chainName: string;
    depositAddress?: string;
    supportedAssets?: Asset[];
  }) {
    super();
    this.chainId = `evm-${config.chainId}`;
    this.chainName = config.chainName;
    this.depositAddress = config.depositAddress || '0xYour...MockAddress';

    // Default supported assets
    this.supportedAssets = config.supportedAssets || [
      { symbol: 'USDT', decimals: 6, contractAddress: '0x...' },
      { symbol: 'USDC', decimals: 6, contractAddress: '0x...' },
    ];
  }

  async createDepositAddress(userId: string): Promise<DepositAddress> {
    // For Phase 1: Single hot wallet + memo system
    // Phase 4: Generate deterministic addresses from HD wallet

    const memo = Buffer.from(userId).toString('base64').slice(0, 16);
    const qrData = `ethereum:${this.depositAddress}?value=10`;

    return {
      address: this.depositAddress,
      memo,
      qrCode: await this.generateQRCode(qrData),
    };
  }

  async verifyTransaction(txHash: string): Promise<TransactionStatus> {
    // Mock verification for Phase 1
    console.log('[EVMAdapter] Mock verifying transaction:', txHash);

    return {
      txHash,
      status: 'confirmed',
      confirmations: 12,
      requiredConfirmations: 12,
      amount: 10_000000n, // 10 USDT (6 decimals)
      asset: 'USDT',
      from: '0xFrom...MockAddress',
      to: this.depositAddress,
      timestamp: new Date(),
      blockNumber: 1234567,
    };
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    return this.verifyTransaction(txHash);
  }

  async withdraw(params: WithdrawParams): Promise<WithdrawResult> {
    console.log('[EVMAdapter] Mock withdrawal:', params);

    const mockTxHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`;

    return {
      txHash: mockTxHash,
      estimatedConfirmationTime: 180, // 3 minutes
      actualFee: 500000n, // 0.5 USDT
    };
  }

  async estimateFee(asset: string, amount: bigint): Promise<FeeEstimate> {
    return {
      fee: 500000n, // ~0.5 USDT
      feeAsset: 'ETH',
      estimatedTime: 180,
    };
  }

  async getBalance(address: string, asset: string): Promise<bigint> {
    return 100_000000n; // 100 USDT
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  validateAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatAmount(amount: bigint, asset: string): string {
    const assetInfo = this.supportedAssets.find(a => a.symbol === asset);
    if (!assetInfo) throw new Error(`Asset ${asset} not supported`);

    const divisor = BigInt(10 ** assetInfo.decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;

    return `${whole}.${fraction.toString().padStart(assetInfo.decimals, '0')}`;
  }

  parseAmount(amount: string, asset: string): bigint {
    const assetInfo = this.supportedAssets.find(a => a.symbol === asset);
    if (!assetInfo) throw new Error(`Asset ${asset} not supported`);

    const [whole, fraction = '0'] = amount.split('.');
    const paddedFraction = fraction.padEnd(assetInfo.decimals, '0').slice(0, assetInfo.decimals);

    return BigInt(whole) * BigInt(10 ** assetInfo.decimals) + BigInt(paddedFraction);
  }
}
