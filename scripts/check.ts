import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);
  const net = await ethers.provider.getNetwork();
  console.log("Network chainId:", net.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "MON");
}
main().catch((e) => { console.error(e); process.exit(1); });
