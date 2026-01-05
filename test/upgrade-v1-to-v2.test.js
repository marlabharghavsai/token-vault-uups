const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Upgrade V1 to V2", function () {
  let token, vault, admin, user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    // Deploy Mock Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy();

    // Deploy V1 as proxy
    const VaultV1 = await ethers.getContractFactory("TokenVaultV1");
    vault = await upgrades.deployProxy(
      VaultV1,
      [token.target, admin.address, 500],
      { kind: "uups" }
    );

    // Fund user
    await token.transfer(user.address, ethers.parseEther("1000"));
    await token.connect(user).approve(vault.target, ethers.parseEther("1000"));
    await vault.connect(user).deposit(ethers.parseEther("1000"));
  });

  it("should preserve user balances after upgrade", async function () {
    const before = await vault.balanceOf(user.address);

    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    const after = await vault.balanceOf(user.address);
    expect(after).to.equal(before);
  });

  it("should preserve total deposits after upgrade", async function () {
    const before = await vault.totalDeposits();

    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    expect(await vault.totalDeposits()).to.equal(before);
  });

  it("should maintain admin access control after upgrade", async function () {
    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    await expect(vault.setYieldRate(500)).to.not.be.reverted;
  });

  it("should allow setting yield rate in V2", async function () {
    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    await vault.setYieldRate(500);
    expect(await vault.getYieldRate()).to.equal(500);
  });

  it("should calculate yield correctly", async function () {
    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    await vault.setYieldRate(1000); // 10%

    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await vault.connect(user).claimYield();

    const balance = await vault.balanceOf(user.address);
    expect(balance).to.be.gt(0);
  });

  it("should prevent non-admin from setting yield rate", async function () {
    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    await expect(
      vault.connect(user).setYieldRate(500)
    ).to.be.reverted;
  });

  it("should allow pausing deposits in V2", async function () {
    const VaultV2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, VaultV2);
    await vault.initializeV2();

    await vault.pauseDeposits();

    await expect(
      vault.connect(user).deposit(1)
    ).to.be.reverted;
  });
});
