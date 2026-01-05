const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await ethers.getContractFactory("MockERC20");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const VaultV1 = await ethers.getContractFactory("TokenVaultV1");
  const vault = await upgrades.deployProxy(
    VaultV1,
    [token.target, deployer.address, 500],
    { kind: "uups" }
  );

  await vault.waitForDeployment();
  console.log("Token:", token.target);
  console.log("Vault (V1 Proxy):", vault.target);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
