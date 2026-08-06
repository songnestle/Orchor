/**
 * 把真实链上演示活动铺满全部 20 张卡:
 *   - 未持有的卡全部解锁(便宜卡买 2 份,流通量有层次)
 *   - Energy 分轮充值(全额回流金库=本钱包,净耗仅 gas)
 *   - 每卡 2~6 次真实 invokeSkill,次数与卡价成反比
 * 全部是真实交易,索引器如实统计。状态轮询确认(RPC 收据索引不可靠)。
 *
 * Usage: npx tsx scripts/demo-activity-all.local.ts
 */
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
import { SKILL_MODULES } from "../src/lib/skills";

dotenv({ path: ".env.local" });
dotenv();

const RPC = process.env.INJECTIVE_TESTNET_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/";
const CONTRACT = process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS!;

const ABI = [
  "function unlockSkill(uint256 skillId, uint256 amount) payable",
  "function topUpEnergy() payable",
  "function invokeSkill(uint256 skillId, bytes32 inputHash)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function energyOf(address) view returns (uint256)",
  "function getSkill(uint256) view returns (tuple(string name, address creator, uint8 rarity, uint64 energyCost, uint128 unlockPriceWei, uint128 subscriptionPriceWei, uint32 mintCap, uint32 minted, bool active))",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitState(desc: string, cond: () => Promise<boolean>, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await cond()) return; } catch { /* transient */ }
    await sleep(2000);
  }
  throw new Error(`TIMEOUT: ${desc}`);
}

/** 调用次数:与解锁价成反比,2~6 次。 */
function invokesFor(priceInj: number): number {
  if (priceInj >= 0.15) return 2;
  if (priceInj >= 0.08) return 3;
  if (priceInj >= 0.05) return 4;
  if (priceInj >= 0.03) return 5;
  return 6;
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
  const w = new ethers.Wallet(process.env.INJECTIVE_PRIVATE_KEY!, provider);
  const c = new ethers.Contract(CONTRACT, ABI, w);
  console.log("start balance:", ethers.formatEther(await provider.getBalance(w.address)), "INJ");

  // ── 1. 解锁未持有的卡 ──
  for (const s of SKILL_MODULES) {
    const held = Number(await c.balanceOf(w.address, s.id));
    if (held > 0) { console.log(`#${s.id} already held x${held}`); continue; }
    const info = await c.getSkill(s.id);
    const qty = s.priceMON <= 0.04 && s.rarity !== "Mythic" ? 2 : 1;
    await c.unlockSkill(s.id, qty, { value: info.unlockPriceWei * BigInt(qty) });
    await waitState(`unlock #${s.id}`, async () => Number(await c.balanceOf(w.address, s.id)) >= qty);
    console.log(`unlocked #${s.id} ${s.title} x${qty}`);
  }

  // ── 2. 计算所需 Energy 并分轮充值 ──
  const plan = SKILL_MODULES.map((s) => ({ id: s.id, n: invokesFor(s.priceMON), cost: s.energyCost, title: s.title }));
  const need = plan.reduce((a, p) => a + p.n * p.cost, 0);
  console.log(`invoke plan needs ${need}⚡`);

  const ensureEnergy = async (min: number) => {
    let e = Number(await c.energyOf(w.address));
    while (e < min) {
      const before = e;
      await c.topUpEnergy({ value: ethers.parseEther("0.9") });
      await waitState("topUpEnergy", async () => Number(await c.energyOf(w.address)) > before);
      e = Number(await c.energyOf(w.address));
      console.log(`topped up → ${e}⚡`);
    }
  };

  // ── 3. 真实调用 ──
  for (const p of plan) {
    await ensureEnergy(p.cost * p.n);
    for (let k = 0; k < p.n; k++) {
      const before = Number(await c.energyOf(w.address));
      const hash = ethers.keccak256(ethers.toUtf8Bytes(`demo-all-${p.id}-${k}-${before}`));
      await c.invokeSkill(p.id, hash);
      await waitState(`invoke #${p.id} ${k + 1}/${p.n}`, async () => Number(await c.energyOf(w.address)) < before);
    }
    console.log(`invoked #${p.id} ${p.title} ×${p.n}`);
  }

  console.log("done. energy left:", Number(await c.energyOf(w.address)), "⚡,",
    "balance:", ethers.formatEther(await provider.getBalance(w.address)), "INJ");
}

main().catch((e) => { console.error(e); process.exit(1); });
