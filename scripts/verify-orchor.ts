import pkg from "hardhat";
const { ethers } = pkg;

// Post-deploy sanity check: reads the live OrchorCore1155 catalog so you can
// eyeball that all skills registered correctly.
//   npx hardhat run scripts/verify-orchor.ts --network injectiveTestnet
// Blockscout SOURCE verification is a different command:
//   npx hardhat verify --network injectiveTestnet <address> <treasury>
async function main() {
  const address =
    process.env.ORCHOR_ADDRESS || process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS;
  if (!address) {
    throw new Error("Set NEXT_PUBLIC_ORCHOR_CORE_ADDRESS (or ORCHOR_ADDRESS) in .env.local");
  }
  const c = await ethers.getContractAt("OrchorCore1155", address);
  const total = await c.nextSkillId();
  console.log("Contract:", address);
  console.log("nextSkillId =", total.toString());
  for (let i = 0; i < Number(total); i++) {
    const s = await c.getSkill(i);
    const rarity = ["Common", "Rare", "Epic", "Legendary", "Mythic"][Number(s.rarity)];
    console.log(
      `#${i.toString().padStart(2, " ")} ${s.name.padEnd(30, " ")} ${rarity.padEnd(9, " ")} ` +
      `${s.energyCost}⚡ unlock=${ethers.formatEther(s.unlockPriceWei)} INJ ` +
      `cap=${s.mintCap} active=${s.active}`
    );
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
