import pkg from "hardhat";
const { ethers } = pkg;

// Resumable seeding script for an OrchorCore contract that's ALREADY deployed
// (use this when deploy-orchor.ts's own deploy tx succeeded but the client
// died before/while seeding — common on a congested public testnet RPC).
// Usage: ORCHOR_ADDRESS=0x... npx hardhat run scripts/seed-injective.ts --network injectiveTestnet

const R = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 } as const;

const SEED: Array<{
  id: number;
  name: string;
  rarity: keyof typeof R;
  energyCost: number;
  unlockMON: string;
  subMON: string;
  mintCap: number;
}> = [
  { id:  0, name: "VC Research Agent",         rarity: "Legendary", energyCost: 8, unlockMON: "0.10", subMON: "0.8", mintCap:   0 },
  { id:  1, name: "Solidity Security Scanner", rarity: "Mythic",    energyCost: 12, unlockMON: "0.20", subMON: "1.2", mintCap: 100 },
  { id:  2, name: "Market Map Generator",      rarity: "Epic",      energyCost: 5, unlockMON: "0.06", subMON: "0.5", mintCap:   0 },
  { id:  3, name: "Competitor Scanner",        rarity: "Rare",      energyCost: 3, unlockMON: "0.04", subMON: "0.3", mintCap:   0 },
  { id:  4, name: "PM Strategy Pack",          rarity: "Epic",      energyCost: 5, unlockMON: "0.07", subMON: "0.5", mintCap:   0 },
  { id:  5, name: "User Interview Summarizer", rarity: "Rare",      energyCost: 2, unlockMON: "0.03", subMON: "0.25", mintCap:   0 },
  { id:  6, name: "GTM Launch Planner",        rarity: "Epic",      energyCost: 4, unlockMON: "0.05", subMON: "0.45", mintCap:   0 },
  { id:  7, name: "Contract Risk Explainer",   rarity: "Epic",      energyCost: 4, unlockMON: "0.05", subMON: "0.4", mintCap:   0 },
  { id:  8, name: "Testnet Deploy Assistant",  rarity: "Rare",      energyCost: 3, unlockMON: "0.04", subMON: "0.3", mintCap:   0 },
  { id:  9, name: "Onchain Data Pulse",        rarity: "Epic",      energyCost: 5, unlockMON: "0.06", subMON: "0.5", mintCap:   0 },
  { id: 10, name: "Agent Workflow Runner",     rarity: "Mythic",    energyCost: 15, unlockMON: "0.18", subMON: "1.5", mintCap:  50 },
  { id: 11, name: "Crypto Meme Stylist",       rarity: "Common",    energyCost: 1, unlockMON: "0.01", subMON: "0.08", mintCap:   0 },
  // Imported from the open-source skills ecosystem (see src/lib/skills.ts)
  { id: 12, name: "MCP Server Builder",        rarity: "Legendary", energyCost: 9, unlockMON: "0.12", subMON: "0.9", mintCap:   0 },
  { id: 13, name: "Webapp Testing Agent",      rarity: "Epic",      energyCost: 5, unlockMON: "0.06", subMON: "0.5", mintCap:   0 },
  { id: 14, name: "Frontend Design Director",  rarity: "Epic",      energyCost: 4, unlockMON: "0.05", subMON: "0.45", mintCap:   0 },
  { id: 15, name: "Skill Creator",             rarity: "Mythic",    energyCost: 12, unlockMON: "0.15", subMON: "1.2", mintCap:  80 },
  { id: 16, name: "Ethereum Contract Engineer",rarity: "Legendary", energyCost: 8, unlockMON: "0.10", subMON: "0.8", mintCap:   0 },
  { id: 17, name: "Cyber Security Strategist", rarity: "Epic",      energyCost: 5, unlockMON: "0.06", subMON: "0.5", mintCap:   0 },
  { id: 18, name: "Data Science Analyst",      rarity: "Rare",      energyCost: 3, unlockMON: "0.04", subMON: "0.3", mintCap:   0 },
  { id: 19, name: "RegEx Forge",               rarity: "Common",    energyCost: 1, unlockMON: "0.01", subMON: "0.08", mintCap:   0 },
];

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 6): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  [${label}] try ${i}/${tries} failed: ${msg.slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  throw lastErr;
}

async function main() {
  const address = process.env.ORCHOR_ADDRESS;
  if (!address) {
    console.error("Set ORCHOR_ADDRESS env var to the already-deployed OrchorCore address.");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Target contract:", address);

  const Factory = await ethers.getContractFactory("OrchorCore");
  const c = Factory.attach(address);

  let already = Number(await withRetry("nextSkillId", () => c.nextSkillId()));
  console.log(`Already registered: ${already}/${SEED.length}`);

  for (const s of SEED) {
    if (s.id < already) {
      console.log(`  · skip #${s.id} ${s.name} (already onchain)`);
      continue;
    }

    // Send (no nonce override — plain populate signs with 1439 correctly),
    // then poll nextSkillId until it advances past this id instead of using
    // tx.wait(), which hangs on the flaky public RPC.
    await withRetry(`send#${s.id}`, async () => {
      const tx = await c.registerSkill(
        s.name,
        R[s.rarity],
        s.energyCost,
        ethers.parseEther(s.unlockMON),
        ethers.parseEther(s.subMON),
        s.mintCap
      );
      console.log(`  → sent #${s.id} ${s.name} tx=${tx.hash.slice(0, 12)}…`);
      return tx.hash;
    });

    await withRetry(`confirm#${s.id}`, async () => {
      const cur = Number(await c.nextSkillId());
      if (cur <= s.id) throw new Error(`not mined yet (nextSkillId=${cur})`);
      return cur;
    }, 10);

    const mark = s.rarity === "Mythic" ? "✦" : s.rarity === "Legendary" ? "★" : " ";
    console.log(` ${mark} #${s.id} ${s.name} confirmed`);
    already = s.id + 1;
  }

  console.log("\n────────────────────────────────────────");
  console.log("Final nextSkillId:", already, "/", SEED.length);
  console.log("NEXT_PUBLIC_ORCHOR_CORE_ADDRESS=" + address);
  console.log("────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
