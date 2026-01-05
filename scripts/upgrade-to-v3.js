const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) throw new Error("Set PROXY_ADDRESS");

  const VaultV3 = await ethers.getContractFactory("TokenVaultV3");
  const vault = await upgrades.upgradeProxy(proxyAddress, VaultV3);
  await vault.initializeV3();

  console.log("Upgraded to V3 at:", vault.target);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
