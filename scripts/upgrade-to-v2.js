const { upgrades } = require("hardhat");

async function main() {
  const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
  await upgrades.upgradeProxy(PROXY_ADDRESS, VaultV2);
}
main();
