/**
 * 上线自检(链上部分):
 *   1. 钱包 A 解锁一张卡(#11 Crypto Meme Stylist, 0.01 INJ)
 *   2. uri() 返回可解析的全链上 metadata + 内联 SVG
 *   3. A 转让给 B → A 权限消失、B 权限出现
 * 状态确认走轮询(此 RPC 不按 eth hash 索引收据)。
 *
 * Usage: npx tsx scripts/selfcheck.local.ts
 */
import { config as dotenv } from "dotenv";
import { ethers } from "ethers";

dotenv({ path: ".env.local" });
dotenv();

const RPC = process.env.INJECTIVE_TESTNET_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/";
const CONTRACT = process.env.ORCHOR_ADDRESS || process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS || "";
if (!CONTRACT) throw new Error("Set NEXT_PUBLIC_ORCHOR_CORE_ADDRESS (or ORCHOR_ADDRESS) in .env.local");
const SKILL_ID = 11; // Crypto Meme Stylist — cheapest card (0.01 INJ)

const ABI = [
  "function unlockSkill(uint256 skillId, uint256 amount) payable",
  "function hasAccess(address user, uint256 skillId) view returns (bool)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function uri(uint256 id) view returns (string)",
  "function getSkill(uint256) view returns (tuple(string name, address creator, uint8 rarity, uint64 energyCost, uint128 unlockPriceWei, uint128 subscriptionPriceWei, uint32 mintCap, uint32 minted, bool active))",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor(desc: string, cond: () => Promise<boolean>, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await cond()) return; } catch { /* transient */ }
    await sleep(2000);
  }
  throw new Error(`TIMEOUT: ${desc}`);
}

function ok(label: string, pass: boolean, extra = "") {
  console.log(`${pass ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  if (!pass) process.exitCode = 1;
}

async function main() {
  const pk = process.env.INJECTIVE_PRIVATE_KEY!;
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
  const A = new ethers.Wallet(pk, provider);
  const B = ethers.Wallet.createRandom(); // 只收卡,不发交易,无需 gas
  const c = new ethers.Contract(CONTRACT, ABI, A);

  const skill = await c.getSkill(SKILL_ID);
  console.log(`目标卡: #${SKILL_ID} ${skill.name} (${ethers.formatEther(skill.unlockPriceWei)} INJ)`);
  console.log(`A=${A.address}\nB=${B.address}\n`);

  // ── 1. 解锁 ──
  const balBefore = Number(await c.balanceOf(A.address, SKILL_ID));
  if (balBefore === 0) {
    await c.unlockSkill(SKILL_ID, 1, { value: skill.unlockPriceWei });
    await waitFor("unlock 上链", async () => Number(await c.balanceOf(A.address, SKILL_ID)) > 0);
  }
  ok("解锁后 A 持有卡 (balanceOf=1)", Number(await c.balanceOf(A.address, SKILL_ID)) >= 1);
  ok("解锁后 A 有调用权 (hasAccess=true)", await c.hasAccess(A.address, SKILL_ID));

  // ── 2. uri / SVG ──
  const uri: string = await c.uri(SKILL_ID);
  const isDataJson = uri.startsWith("data:application/json;base64,");
  ok("uri 是 base64 JSON data URI", isDataJson);
  const json = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString("utf8"));
  ok("metadata.name 含技能名", String(json.name).includes(skill.name), json.name);
  const isDataSvg = String(json.image).startsWith("data:image/svg+xml;base64,");
  ok("image 是内联 SVG data URI", isDataSvg);
  const svg = Buffer.from(String(json.image).split(",")[1], "base64").toString("utf8");
  ok("SVG 可解析且含技能名", svg.startsWith("<svg") && svg.includes(skill.name));
  const noExternal = !svg.replace(/xmlns(:[\w-]+)?="http:\/\/www\.w3\.org\/[^"]*"/g, "").includes("http");
  ok("SVG 无外部资源引用(全链上)", noExternal);

  // ── 3. 转让 → 权限迁移 ──
  await c.safeTransferFrom(A.address, B.address, SKILL_ID, 1, "0x");
  await waitFor("transfer 上链", async () => Number(await c.balanceOf(B.address, SKILL_ID)) > 0);
  ok("转让后 B 持有卡", Number(await c.balanceOf(B.address, SKILL_ID)) === 1);
  ok("转让后 B 有调用权", await c.hasAccess(B.address, SKILL_ID));
  ok("转让后 A 卡余额归零", Number(await c.balanceOf(A.address, SKILL_ID)) === 0);
  ok("转让后 A 调用权消失", !(await c.hasAccess(A.address, SKILL_ID)));

  console.log(process.exitCode ? "\n有检查未通过" : "\n链上自检全部通过");
}

main().catch((e) => { console.error(e); process.exit(1); });
