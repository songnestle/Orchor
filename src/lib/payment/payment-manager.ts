import { ChainAdapter } from './adapter';
import { TronAdapter } from './tron-adapter';
import { EVMAdapter } from './evm-adapter';
import { injectiveTestnet, monadTestnet } from '../chain';

/**
 * Payment Manager - Central orchestration for all payment adapters
 */
export class PaymentManager {
  private adapters: Map<string, ChainAdapter>;

  constructor() {
    this.adapters = new Map();
    this.initializeAdapters();
  }

  private initializeAdapters() {
    // TRON Adapter
    const tronAdapter = new TronAdapter({
      depositWallet: process.env.TRON_DEPOSIT_WALLET,
    });
    this.adapters.set('tron', tronAdapter);

    // Injective Testnet EVM Adapter — active chain
    const injectiveAdapter = new EVMAdapter({
      chainId: injectiveTestnet.id,
      chainName: injectiveTestnet.name,
      depositAddress: process.env.EVM_DEPOSIT_WALLET,
    });
    this.adapters.set('evm-injective', injectiveAdapter);

    // Monad EVM Adapter (legacy)
    const monadAdapter = new EVMAdapter({
      chainId: monadTestnet.id,
      chainName: monadTestnet.name,
      depositAddress: process.env.EVM_DEPOSIT_WALLET,
    });
    this.adapters.set('evm-monad', monadAdapter);

    // Base EVM Adapter
    const baseAdapter = new EVMAdapter({
      chainId: 8453,
      chainName: 'Base',
      depositAddress: process.env.EVM_DEPOSIT_WALLET,
    });
    this.adapters.set('evm-base', baseAdapter);

    // Ethereum EVM Adapter
    const ethereumAdapter = new EVMAdapter({
      chainId: 1,
      chainName: 'Ethereum',
      depositAddress: process.env.EVM_DEPOSIT_WALLET,
    });
    this.adapters.set('evm-ethereum', ethereumAdapter);
  }

  /**
   * Get adapter by chain ID
   */
  getAdapter(chainId: string): ChainAdapter {
    const adapter = this.adapters.get(chainId);
    if (!adapter) {
      throw new Error(`No adapter found for chain: ${chainId}`);
    }
    return adapter;
  }

  /**
   * Get all available chains
   */
  getAvailableChains() {
    return Array.from(this.adapters.entries()).map(([id, adapter]) => ({
      id,
      name: adapter.chainName,
      assets: adapter.supportedAssets,
    }));
  }

  /**
   * Calculate credits from deposit amount
   */
  calculateCredits(amount: bigint, asset: string, chainId: string): bigint {
    const adapter = this.getAdapter(chainId);
    const assetInfo = adapter.supportedAssets.find(a => a.symbol === asset);

    if (!assetInfo) {
      throw new Error(`Asset ${asset} not supported on ${chainId}`);
    }

    // 1 USD = 100 credits
    // Assuming stablecoins (USDT/USDC) are 1:1 with USD
    const creditsPerUsd = BigInt(process.env.CREDITS_PER_USD || '100');
    const usdDecimals = BigInt(10 ** assetInfo.decimals);

    // Convert asset amount to credits
    // amount (with decimals) * creditsPerUsd / usdDecimals
    return (amount * creditsPerUsd) / usdDecimals;
  }

  /**
   * Calculate asset amount from credits
   */
  calculateAssetAmount(credits: bigint, asset: string, chainId: string): bigint {
    const adapter = this.getAdapter(chainId);
    const assetInfo = adapter.supportedAssets.find(a => a.symbol === asset);

    if (!assetInfo) {
      throw new Error(`Asset ${asset} not supported on ${chainId}`);
    }

    const creditsPerUsd = BigInt(process.env.CREDITS_PER_USD || '100');
    const usdDecimals = BigInt(10 ** assetInfo.decimals);

    // Convert credits to asset amount
    // credits * usdDecimals / creditsPerUsd
    return (credits * usdDecimals) / creditsPerUsd;
  }

  /**
   * Estimate total withdrawal cost including fees
   */
  async estimateWithdrawalCost(
    credits: bigint,
    asset: string,
    chainId: string
  ): Promise<{
    assetAmount: bigint;
    fee: bigint;
    totalCreditsCost: bigint;
    estimatedTime: number;
  }> {
    const adapter = this.getAdapter(chainId);
    const assetAmount = this.calculateAssetAmount(credits, asset, chainId);
    const feeEstimate = await adapter.estimateFee(asset, assetAmount);

    // Convert fee to credits
    const feeInCredits = this.calculateCredits(feeEstimate.fee, asset, chainId);
    const totalCreditsCost = credits + feeInCredits;

    return {
      assetAmount,
      fee: feeEstimate.fee,
      totalCreditsCost,
      estimatedTime: feeEstimate.estimatedTime,
    };
  }
}

export const paymentManager = new PaymentManager();
