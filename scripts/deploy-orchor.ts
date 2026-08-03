import pkg from "hardhat";
const { ethers } = pkg;
import { SKILL_MODULES } from "../src/lib/skills";

// Rarity enum mirror (must match OrchorCore1155.sol order)
const R = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 } as const;

const MAX_NAME_LEN = 48;

/** Mirror of the contract's registerSkill name rules — fail locally, not mid-seed. */
function assertValidName(name: string) {
  const bytes = Buffer.from(name, "utf8");
  if (bytes.length === 0 || bytes.length > MAX_NAME_LEN) {
    throw new Error(`BAD_NAME_LEN (${bytes.length} bytes): ${name}`);
  }
  for (const b of bytes) {
    if (b === 0x22 || b === 0x5c || b === 0x3c || b === 0x3e) {
      throw new Error(`BAD_NAME_CHAR: ${name}`);
    }
    if (b < 0x20) throw new Error(`BAD_NAME_CTRL: ${name}`);
  }
}

async function main() {
  // ── Validate the whole catalog before spending any gas ──
  SKILL_MODULES.forEach((s, i) => {
    if (s.id !== i) throw new Error(`Catalog ids must be sequential: index ${i} has id ${s.id}`);
    assertValidName(s.title);
    if (!(s.energyCost > 0)) throw new Error(`ZERO_ENERGY: ${s.title}`);
    if (s.rarity === "Mythic" && !((s.mintedOf?.cap ?? 0) > 0)) {
      throw new Error(`MYTHIC_NEEDS_CAP: ${s.title}`);
    }
  });

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account. Set INJECTIVE_PRIVATE_KEY in .env.local (see scripts/gen-deploy-wallet.ts)."
    );
  }
  const bal = await ethers.provider.getBalance(deployer.address);
  const net = await ethers.provider.getNetwork();
  console.log("Network chainId:", net.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "INJ");

  if (bal < ethers.parseEther("0.5")) {
    console.warn(`⚠ Low balance — deploy + ${SKILL_MODULES.length} seed txs may run out of gas.`);
  }

  // Treasury defaults to deployer for the demo. Override via env if you want.
  const treasury = process.env.PLATFORM_TREASURY || deployer.address;

  const Factory = await ethers.getContractFactory("OrchorCore1155");
  const c = await Factory.deploy(treasury);
  await c.waitForDeployment();
  const address = await c.getAddress();
  const deployReceipt = await c.deploymentTransaction()!.wait();
  const deployBlock = deployReceipt!.blockNumber;
  console.log("\nOrchorCore1155 deployed at:", address);
  console.log("Deploy block:          ", deployBlock);
  console.log("Platform treasury:     ", treasury);

  console.log(`\nSeeding ${SKILL_MODULES.length} skills…`);
  for (const s of SKILL_MODULES) {
    const cap = s.rarity === "Mythic" ? s.mintedOf!.cap : 0;
    const tx = await c.registerSkill(
      s.title,
      R[s.rarity],
      s.energyCost,
      ethers.parseEther(String(s.priceMON)),
      ethers.parseEther(String(s.subscriptionMON ?? 0)),
      cap
    );
    const rc = await tx.wait();
    const mark = s.rarity === "Mythic" ? "✦" : s.rarity === "Legendary" ? "★" : " ";
    console.log(
      ` ${mark} #${s.id.toString().padStart(2, " ")} ${s.title.padEnd(30, " ")} ` +
      `${s.rarity.padEnd(9, " ")} ${s.energyCost.toString().padStart(3, " ")}⚡ ` +
      `${s.priceMON} INJ  tx=${rc?.hash.slice(0, 12)}…`
    );
  }

  // On-chain ids are assigned by registration order; they MUST line up with
  // the frontend catalog (useAllSkills merges by id) or every card shows the
  // wrong data. Verify before declaring success.
  const next = await c.nextSkillId();
  if (Number(next) !== SKILL_MODULES.length) {
    throw new Error(`Seed mismatch: nextSkillId=${next}, expected ${SKILL_MODULES.length}`);
  }

  console.log("\n────────────────────────────────────────");
  console.log("NEXT_PUBLIC_ORCHOR_CORE_ADDRESS=" + address);
  console.log("ORCHOR_DEPLOY_BLOCK=" + deployBlock);
  console.log("────────────────────────────────────────");
  console.log("Blockscout source verification:");
  console.log(`  npx hardhat verify --network injectiveTestnet ${address} ${treasury}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
