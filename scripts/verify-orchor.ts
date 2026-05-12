import pkg from "hardhat";
const { ethers } = pkg;
async function main() {
  const c = await ethers.getContractAt("OrchorCore", "0x769fC7dFf74502E5A387eE7EF47A01917A847a03");
  const total = await c.nextSkillId();
  console.log("nextSkillId =", total.toString());
  for (let i = 0; i < Number(total); i++) {
    const s = await c.getSkill(i);
    const rarity = ["Common","Rare","Epic","Legendary","Mythic"][Number(s.rarity)];
    console.log(`#${i.toString().padStart(2," ")} ${s.name.padEnd(28," ")} ${rarity.padEnd(9," ")} ${s.energyCost}⚡ cap=${s.mintCap} active=${s.active}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
