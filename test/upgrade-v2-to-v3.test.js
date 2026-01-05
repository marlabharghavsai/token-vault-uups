const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Upgrade V2 to V3", function () {
  let vault, token, admin, user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy();

    const V1 = await ethers.getContractFactory("TokenVaultV1");
    vault = await upgrades.deployProxy(
      V1,
      [token.target, admin.address, 0],
      { kind: "uups" }
    );

    const V2 = await ethers.getContractFactory("TokenVaultV2");
    vault = await upgrades.upgradeProxy(vault.target, V2);

    await token.transfer(user.address, ethers.parseEther("100"));
    await token.connect(user).approve(vault.target, ethers.parseEther("100"));
    await vault.connect(user).deposit(ethers.parseEther("100"));
  });

  it("should preserve all V2 state after upgrade", async function () {
    await vault.setYieldRate(500);

    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    expect(await vault.getYieldRate()).to.equal(500);
  });

  it("should allow setting withdrawal delay", async function () {
    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    await vault.setWithdrawalDelay(100);
    expect(await vault.getWithdrawalDelay()).to.equal(100);
  });

  it("should handle withdrawal requests correctly", async function () {
    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    await vault.setWithdrawalDelay(100);
    await vault.connect(user).requestWithdrawal(ethers.parseEther("10"));

    const req = await vault.getWithdrawalRequest(user.address);
    expect(req.amount).to.equal(ethers.parseEther("10"));
  });

  it("should enforce withdrawal delay", async function () {
    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    await vault.setWithdrawalDelay(100);
    await vault.connect(user).requestWithdrawal(10);

    await expect(
      vault.connect(user).executeWithdrawal()
    ).to.be.reverted;
  });

  it("should allow emergency withdrawals", async function () {
    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    await vault.connect(user).emergencyWithdraw();
  });

  it("should prevent premature withdrawal execution", async function () {
    const V3 = await ethers.getContractFactory("TokenVaultV3");
    vault = await upgrades.upgradeProxy(vault.target, V3);

    await vault.setWithdrawalDelay(200);
    await vault.connect(user).requestWithdrawal(10);

    await expect(
      vault.connect(user).executeWithdrawal()
    ).to.be.reverted;
  });
});
