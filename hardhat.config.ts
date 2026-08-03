import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

// Project convention is .env.local (Next.js auto-loads it); dotenv's default
// only looks for .env, so load .env.local explicitly, falling back to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

const MONAD_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const INJECTIVE_TESTNET_RPC_URL =
  process.env.INJECTIVE_TESTNET_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/";
const INJECTIVE_PRIVATE_KEY = process.env.INJECTIVE_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // 全链上 SVG 的 tokenURI 在旧代码生成器下 Stack too deep,
      // viaIR 是官方给这类合约的标准答案。编译会慢一点,值得。
      // 已验证:viaIR 下字节码 19,802 字节,低于 24,576 上限。
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    monadTestnet: {
      url: MONAD_RPC_URL,
      chainId: 10143,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    injectiveTestnet: {
      url: INJECTIVE_TESTNET_RPC_URL,
      chainId: 1439,
      accounts: INJECTIVE_PRIVATE_KEY ? [INJECTIVE_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // Blockscout instances accept any non-empty apiKey string.
    apiKey: { injectiveTestnet: "blockscout" },
    customChains: [
      {
        network: "injectiveTestnet",
        chainId: 1439,
        urls: {
          apiURL: "https://testnet.blockscout-api.injective.network/api",
          browserURL: "https://testnet.blockscout.injective.network",
        },
      },
    ],
  },
};

export default config;
