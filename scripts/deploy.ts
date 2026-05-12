import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("SkillFlow");
  const skillflow = await Factory.deploy();
  await skillflow.waitForDeployment();

  const address = await skillflow.getAddress();
  console.log("SkillFlow deployed at:", address);

  const seedSkills: Array<{ name: string; price: bigint }> = [
    { name: "Research Oracle", price: ethers.parseEther("0.0003") },
    { name: "Copywriting Engine", price: ethers.parseEther("0.0004") },
    { name: "Viral Twitter Agent", price: ethers.parseEther("0.0003") },
    { name: "Meme Context Adapter", price: ethers.parseEther("0.0002") },
    { name: "Brand Positioning Agent", price: ethers.parseEther("0.0005") },
  ];

  for (let i = 0; i < seedSkills.length; i++) {
    const s = seedSkills[i];
    const tx = await skillflow.registerSkill(s.name, s.price);
    const receipt = await tx.wait();
    console.log(`Registered skill #${i} "${s.name}"  tx=${receipt?.hash}`);
  }

  console.log("\nDone.");
  console.log("NEXT_PUBLIC_SKILLFLOW_CONTRACT_ADDRESS=" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
