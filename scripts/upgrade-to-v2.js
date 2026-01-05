const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("Please set PROXY_ADDRESS environment variable");
  }

  console.log("Upgrading proxy at:", proxyAddress);

  const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
  const vault = await upgrades.upgradeProxy(proxyAddress, VaultV2);

  // IMPORTANT: call reinitializer to set PAUSER_ROLE
  await vault.initializeV2();

  console.log("Upgrade to V2 successful");
  console.log("Proxy address:", vault.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

