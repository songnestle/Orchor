/**
 * Resume seeding OrchorCore1155 after an interrupted deploy run.
 *
 * Injective quirk: this RPC does not reliably index receipts by the
 * client-computed eth tx hash (EVM txs ride inside Cosmos txs), so
 * receipt-polling hangs even though the tx executed. Confirm by STATE
 * instead: poll nextSkillId until it advances. Idempotent — safe to rerun.
 *
 * Usage: npx tsx scripts/seed-resume.local.ts
 */
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
import { SKILL_MODULES } from "../src/lib/skills";

dotenv({ path: ".env.local" });
dotenv();

const RPC = process.env.INJECTIVE_TESTNET_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/";
const CONTRACT = process.env.ORCHOR_ADDRESS || process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS || "";
if (!CONTRACT) throw new Error("Set NEXT_PUBLIC_ORCHOR_CORE_ADDRESS (or ORCHOR_ADDRESS) in .env.local");
const R: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 };

const ABI = [
  "function registerSkill(string name, uint8 rarity, uint64 energyCost, uint128 unlockPriceWei, uint128 subscriptionPriceWei, uint32 mintCap) returns (uint256)",
  "function nextSkillId() view returns (uint256)",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const pk = process.env.INJECTIVE_PRIVATE_KEY;
  if (!pk) throw new Error("INJECTIVE_PRIVATE_KEY missing");
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
  const wallet = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(CONTRACT, ABI, wallet);

  let current = Number(await c.nextSkillId());
  console.log(`nextSkillId=${current}; target=${SKILL_MODULES.length}`);

  while (current < SKILL_MODULES.length) {
    const s = SKILL_MODULES[current];
    if (s.id !== current) throw new Error(`Catalog order mismatch: index ${current} has id ${s.id}`);
    const cap = s.rarity === "Mythic" ? s.mintedOf!.cap : 0;

    const nonce = await provider.getTransactionCount(wallet.address, "latest");
    try {
      await c.registerSkill(
        s.title, R[s.rarity], s.energyCost,
        ethers.parseEther(String(s.priceMON)),
        ethers.parseEther(String(s.subscriptionMON ?? 0)),
        cap,
        { nonce }
      );
    } catch (e: any) {
      console.log(`  send #${current} error (will re-check state): ${e.message?.slice(0, 100)}`);
    }

    // Confirm by state change, not receipt.
    const deadline = Date.now() + 90_000;
    let advanced = false;
    while (Date.now() < deadline) {
      await sleep(2000);
      try {
        const now = Number(await c.nextSkillId());
        if (now > current) { current = now; advanced = true; break; }
      } catch { /* transient — keep polling */ }
    }
    if (!advanced) throw new Error(`Skill #${current} (${s.title}) not registered after 90s — inspect manually`);
    console.log(`  #${String(current - 1).padStart(2, " ")} ${s.title.padEnd(30, " ")} confirmed (nextSkillId=${current})`);
  }

  console.log(`done: nextSkillId=${current} (expected ${SKILL_MODULES.length})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
