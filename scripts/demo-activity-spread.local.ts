/**
 * 让 32 张卡的链上调用量拉开真实梯度。
 *
 * 之前每张卡都是个位数、彼此接近,配上"各卡自归一化"的曲线,视觉上
 * 全都一样。现在按稀有度/能耗给出差异化目标(便宜的 Common 调用多、
 * 昂贵的 Mythic 少 —— 符合真实市场行为),只补足差额。
 *
 * 所有调用都是真实的 invokeSkill 交易,数字可在 Blockscout 逐笔核对。
 * 幂等:先扫链上 SkillInvoked 事件算出已有次数,达标的卡直接跳过。
 *
 * 成本说明:topUpEnergy 全额进 platformTreasury,而 treasury 就是本
 * 钱包,所以充值的钱转一圈回到自己账上,真实开销只有 gas + 解锁时
 * 沉淀在合约里的 5%。
 *
 * Usage: npx tsx scripts/demo-activity-spread.local.ts
 */
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";
import { SKILL_MODULES } from "../src/lib/skills";

dotenv({ path: ".env.local" });
dotenv();

const RPC = process.env.INJECTIVE_TESTNET_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/";
const CONTRACT = process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS!;
const DEPLOY_BLOCK = BigInt(process.env.ORCHOR_DEPLOY_BLOCK || "135633301");
const CHUNK = 9_500n;

const ABI = [
  "function unlockSkill(uint256 skillId, uint256 amount) payable",
  "function topUpEnergy() payable",
  "function invokeSkill(uint256 skillId, bytes32 inputHash)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function energyOf(address) view returns (uint256)",
  "function getSkill(uint256) view returns (tuple(string name, address creator, uint8 rarity, uint64 energyCost, uint128 unlockPriceWei, uint128 subscriptionPriceWei, uint32 mintCap, uint32 minted, bool active))",
  "event SkillInvoked(address indexed user, uint256 indexed skillId, uint64 energySpent, bytes32 inputHash)",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitState(desc: string, cond: () => Promise<boolean>, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await cond()) return; } catch { /* transient */ }
    await sleep(1500);
  }
  throw new Error(`TIMEOUT: ${desc}`);
}

/** 目标调用数:低价高频、旗舰低频;用 id 扰动,避免同稀有度整齐划一。 */
function targetCalls(id: number, rarity: string, energy: number): number {
  const base: Record<string, number> = { Common: 15, Rare: 10, Epic: 7, Legendary: 5, Mythic: 3 };
  const jitter = [0, 2, -1, 3, 1, -2, 2, 1, -1, 4][id % 10];
  return Math.max(2, base[rarity] + jitter - Math.floor(energy / 7));
}

async function countExisting(provider: ethers.JsonRpcProvider): Promise<Map<number, number>> {
  const iface = new ethers.Interface(ABI);
  const topic = iface.getEvent("SkillInvoked")!.topicHash;
  const latest = BigInt(await provider.getBlockNumber());
  const counts = new Map<number, number>();
  let from = DEPLOY_BLOCK;
  while (from <= latest) {
    const to = from + CHUNK > latest ? latest : from + CHUNK;
    let logs: ethers.Log[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        logs = await provider.getLogs({ address: CONTRACT, topics: [topic], fromBlock: Number(from), toBlock: Number(to) });
        break;
      } catch { await sleep(1500); }
    }
    for (const l of logs) {
      const id = Number(BigInt(l.topics[2]));
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    from = to + 1n;
  }
  return counts;
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
  const w = new ethers.Wallet(process.env.INJECTIVE_PRIVATE_KEY!, provider);
  const c = new ethers.Contract(CONTRACT, ABI, w);

  console.log("扫描已有调用事件…");
  const existing = await countExisting(provider);

  const plan = SKILL_MODULES.map((s) => {
    const have = existing.get(s.id) ?? 0;
    const want = targetCalls(s.id, s.rarity, s.energyCost);
    return { id: s.id, title: s.title, rarity: s.rarity, energy: s.energyCost, have, want, need: Math.max(0, want - have) };
  });

  const needTotal = plan.reduce((a, p) => a + p.need, 0);
  const needEnergy = plan.reduce((a, p) => a + p.need * p.energy, 0);
  console.log(`需补 ${needTotal} 次调用,约 ${needEnergy}⚡(分批充值,钱回流 treasury=本钱包)`);
  console.log(`余额 ${ethers.formatEther(await provider.getBalance(w.address))} INJ,Energy ${await c.energyOf(w.address)}⚡\n`);

  for (const p of plan) {
    if (p.need === 0) {
      console.log(`#${String(p.id).padStart(2)} ${p.title.padEnd(30)} 已有 ${p.have}/${p.want},跳过`);
      continue;
    }
    if (Number(await c.balanceOf(w.address, p.id)) === 0) {
      const s = await c.getSkill(p.id);
      await c.unlockSkill(p.id, 1, { value: s.unlockPriceWei });
      await waitState(`unlock #${p.id}`, async () => Number(await c.balanceOf(w.address, p.id)) > 0);
    }

    let done = 0;
    for (let k = 0; k < p.need; k++) {
      let energy = Number(await c.energyOf(w.address));
      if (energy < p.energy) {
        const bal = await provider.getBalance(w.address);
        const topUp = bal > ethers.parseEther("0.6") ? "0.5" : "0.2";
        await c.topUpEnergy({ value: ethers.parseEther(topUp) });
        await waitState("topUp", async () => Number(await c.energyOf(w.address)) > energy);
        energy = Number(await c.energyOf(w.address));
      }
      const before = energy;
      try {
        await c.invokeSkill(p.id, ethers.keccak256(ethers.toUtf8Bytes(`spread-${p.id}-${p.have + k}`)));
        await waitState(`invoke #${p.id}`, async () => Number(await c.energyOf(w.address)) < before);
        done++;
      } catch (e: any) {
        console.log(`  ! #${p.id} 第 ${k + 1} 次失败:${String(e.message).slice(0, 70)}`);
      }
    }
    console.log(`#${String(p.id).padStart(2)} ${p.title.padEnd(30)} ${p.rarity.padEnd(9)} ${p.have} → ${p.have + done} 次`);
  }

  console.log(`\n完成。余额 ${ethers.formatEther(await provider.getBalance(w.address))} INJ,Energy ${await c.energyOf(w.address)}⚡`);
}

main().catch((e) => { console.error(e); process.exit(1); });
