import pkg from "hardhat";
const { ethers } = pkg;

// Deploys OrchorCore and prints the address — seeding is done separately by
// the resumable scripts/seed-injective.ts (safer on a flaky public RPC).
async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log("chainId:", net.chainId.toString(), "deployer:", deployer.address);

  const treasury = process.env.PLATFORM_TREASURY || deployer.address;
  const Factory = await ethers.getContractFactory("OrchorCore");
  const c = await Factory.deploy(treasury);
  await c.waitForDeployment();
  console.log("OrchorCore deployed at:", await c.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
