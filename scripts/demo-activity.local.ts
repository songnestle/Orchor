/**
 * 用部署钱包在链上制造真实演示活动:解锁 3 张卡、充值 Energy、
 * 做若干次真实 invokeSkill。所有数字都是真实链上事件——索引器
 * 会如实统计,不存在编造。状态轮询确认(此 RPC 收据索引不可靠)。
 *
 * Usage: npx tsx scripts/demo-activity.local.ts
 */
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";

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

async function waitState(desc: string, cond: () => Promise<boolean>, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await cond()) return; } catch { /* transient */ }
    await sleep(2000);
  }
  throw new Error(`TIMEOUT: ${desc}`);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
  const w = new ethers.Wallet(process.env.INJECTIVE_PRIVATE_KEY!, provider);
  const c = new ethers.Contract(CONTRACT, ABI, w);
  console.log("wallet:", w.address, "balance:", ethers.formatEther(await provider.getBalance(w.address)), "INJ");

  // 解锁 3 张便宜卡(#11 早前已转走,重新买)
  const unlocks = [11, 3, 5];
  for (const id of unlocks) {
    if (Number(await c.balanceOf(w.address, id)) > 0) { console.log(`#${id} already owned`); continue; }
    const s = await c.getSkill(id);
    await c.unlockSkill(id, 1, { value: s.unlockPriceWei });
    await waitState(`unlock #${id}`, async () => Number(await c.balanceOf(w.address, id)) > 0);
    console.log(`unlocked #${id} ${s.name} (${ethers.formatEther(s.unlockPriceWei)} INJ)`);
  }

  // 充 0.3 INJ = 30⚡
  const e0 = Number(await c.energyOf(w.address));
  if (e0 < 28) {
    await c.topUpEnergy({ value: ethers.parseEther("0.3") });
    await waitState("topUpEnergy", async () => Number(await c.energyOf(w.address)) > e0);
  }
  console.log("energy:", Number(await c.energyOf(w.address)), "⚡");

  // 真实调用:#11(1⚡)×8、#3(3⚡)×4、#5(2⚡)×4 = 28⚡
  const plan: Array<[number, number]> = [[11, 8], [3, 4], [5, 4]];
  for (const [id, times] of plan) {
    for (let k = 0; k < times; k++) {
      const before = Number(await c.energyOf(w.address));
      const inputHash = ethers.keccak256(ethers.toUtf8Bytes(`demo-${id}-${k}`));
      await c.invokeSkill(id, inputHash);
      await waitState(`invoke #${id} (${k + 1}/${times})`, async () => Number(await c.energyOf(w.address)) < before);
      process.stdout.write(`invoke #${id} ${k + 1}/${times}  `);
    }
    console.log();
  }

  console.log("done. energy left:", Number(await c.energyOf(w.address)), "⚡,",
    "INJ left:", ethers.formatEther(await provider.getBalance(w.address)));
}

main().catch((e) => { console.error(e); process.exit(1); });
