/**
 * One-off utility: generates a fresh EVM keypair and writes the private key
 * directly into .env.local under the given env var name. The private key is
 * NEVER printed to stdout — only the public address is, so it's safe to
 * paste into chat/tickets when asking someone to fund it via a faucet.
 *
 * Usage: npx tsx scripts/gen-deploy-wallet.ts INJECTIVE_PRIVATE_KEY
 */
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const varName = process.argv[2];
if (!varName) {
  console.error("Usage: npx tsx scripts/gen-deploy-wallet.ts <ENV_VAR_NAME>");
  process.exit(1);
}

const pk = generatePrivateKey();
const account = privateKeyToAccount(pk);

const envPath = resolve(process.cwd(), ".env.local");
let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

const line = `${varName}=${pk}`;
const re = new RegExp(`^${varName}=.*$`, "m");
if (re.test(content)) {
  content = content.replace(re, line);
} else {
  content = content.trimEnd() + `\n\n# Auto-generated deploy wallet (testnet only — see address below)\n# Address: ${account.address}\n${line}\n`;
}
writeFileSync(envPath, content);

console.log("Generated new wallet, private key written to .env.local as " + varName);
console.log("Address:", account.address);
console.log("Fund this address via the target testnet's faucet before deploying.");
