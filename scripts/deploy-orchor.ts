import pkg from "hardhat";
const { ethers } = pkg;

// Rarity enum mirror (must match OrchorCore.sol order)
const R = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 } as const;

// Seed catalog — mirrors src/lib/skills.ts. Prices are in MON.
// mintCap is required (>0) only for Mythic; must be 0 otherwise.
const SEED: Array<{
  id: number;
  name: string;
  rarity: keyof typeof R;
  energyCost: number;
  unlockMON: string;
  subMON: string;
  mintCap: number;
}> = [
  { id:  0, name: "VC Research Agent",         rarity: "Legendary", energyCost:  48, unlockMON: "0.12", subMON: "3.8", mintCap:   0 },
  { id:  1, name: "Solidity Security Scanner", rarity: "Mythic",    energyCost:  82, unlockMON: "0.18", subMON: "5.2", mintCap: 100 },
  { id:  2, name: "Market Map Generator",      rarity: "Epic",      energyCost:  28, unlockMON: "0.08", subMON: "2.5", mintCap:   0 },
  { id:  3, name: "Competitor Scanner",        rarity: "Rare",      energyCost:  14, unlockMON: "0.05", subMON: "1.8", mintCap:   0 },
  { id:  4, name: "PM Strategy Pack",          rarity: "Epic",      energyCost:  32, unlockMON: "0.09", subMON: "2.9", mintCap:   0 },
  { id:  5, name: "User Interview Summarizer", rarity: "Rare",      energyCost:  12, unlockMON: "0.04", subMON: "1.4", mintCap:   0 },
  { id:  6, name: "GTM Launch Planner",        rarity: "Epic",      energyCost:  26, unlockMON: "0.07", subMON: "2.4", mintCap:   0 },
  { id:  7, name: "Contract Risk Explainer",   rarity: "Epic",      energyCost:  24, unlockMON: "0.07", subMON: "2.2", mintCap:   0 },
  { id:  8, name: "Testnet Deploy Assistant",  rarity: "Rare",      energyCost:  14, unlockMON: "0.05", subMON: "1.7", mintCap:   0 },
  { id:  9, name: "Onchain Data Pulse",        rarity: "Epic",      energyCost:  30, unlockMON: "0.08", subMON: "2.6", mintCap:   0 },
  { id: 10, name: "Agent Workflow Runner",     rarity: "Mythic",    energyCost: 120, unlockMON: "0.15", subMON: "4.5", mintCap:  50 },
  { id: 11, name: "Crypto Meme Stylist",       rarity: "Common",    energyCost:   6, unlockMON: "0.02", subMON: "0.8", mintCap:   0 },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);
  const net = await ethers.provider.getNetwork();
  console.log("Network chainId:", net.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "MON");

  if (bal < ethers.parseEther("0.5")) {
    console.warn("⚠ Low balance — deploy + 12 seed txs may need ~0.3 MON for gas.");
  }

  // Treasury defaults to deployer for the demo. Override via env if you want.
  const treasury = process.env.PLATFORM_TREASURY || deployer.address;

  const Factory = await ethers.getContractFactory("OrchorCore");
  const c = await Factory.deploy(treasury);
  await c.waitForDeployment();
  const address = await c.getAddress();
  console.log("\nOrchorCore deployed at:", address);
  console.log("Platform treasury:     ", treasury);

  console.log("\nSeeding 12 skills…");
  for (const s of SEED) {
    const tx = await c.registerSkill(
      s.name,
      R[s.rarity],
      s.energyCost,
      ethers.parseEther(s.unlockMON),
      ethers.parseEther(s.subMON),
      s.mintCap
    );
    const rc = await tx.wait();
    const mark = s.rarity === "Mythic" ? "✦" : s.rarity === "Legendary" ? "★" : " ";
    console.log(
      ` ${mark} #${s.id.toString().padStart(2, " ")} ${s.name.padEnd(28, " ")} ` +
      `${s.rarity.padEnd(9, " ")} ${s.energyCost.toString().padStart(3, " ")}⚡ ` +
      `${s.unlockMON} MON  tx=${rc?.hash.slice(0, 12)}…`
    );
  }

  console.log("\n────────────────────────────────────────");
  console.log("NEXT_PUBLIC_ORCHOR_CORE_ADDRESS=" + address);
  console.log("────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
