const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BODDUFaucet", function () {
  let bodduToken;
  let faucet;
  let owner;
  let addr1;
  let addr2;
  
  const INITIAL_SUPPLY = 1000000;
  const DRIP_AMOUNT = ethers.parseEther("100");
  const COOLDOWN_TIME = 86400; // 24 hours
  const FAUCET_FUNDING = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy token
    const BODDUToken = await ethers.getContractFactory("BODDUToken");
    bodduToken = await BODDUToken.deploy(INITIAL_SUPPLY);
    
    // Deploy faucet
    const BODDUFaucet = await ethers.getContractFactory("BODDUFaucet");
    faucet = await BODDUFaucet.deploy(
      await bodduToken.getAddress(),
      DRIP_AMOUNT,
      COOLDOWN_TIME
    );
    
    // Fund the faucet
    await bodduToken.transfer(await faucet.getAddress(), FAUCET_FUNDING);
  });

  describe("Deployment", function () {
    it("Should set correct token address", async function () {
      expect(await faucet.bodduToken()).to.equal(await bodduToken.getAddress());
    });

    it("Should set correct drip amount and cooldown", async function () {
      expect(await faucet.dripAmount()).to.equal(DRIP_AMOUNT);
      expect(await faucet.cooldownTime()).to.equal(COOLDOWN_TIME);
    });
  });

  describe("Claiming", function () {
    it("Should allow users to claim tokens", async function () {
      await faucet.connect(addr1).claim();
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(DRIP_AMOUNT);
    });

    it("Should not allow claiming before cooldown", async function () {
      await faucet.connect(addr1).claim();
      await expect(faucet.connect(addr1).claim()).to.be.revertedWith(
        "Cooldown period not elapsed"
      );
    });

    it("Should allow claiming after cooldown", async function () {
      await faucet.connect(addr1).claim();
      
      // Fast forward time
      await time.increase(COOLDOWN_TIME);
      
      await faucet.connect(addr1).claim();
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(DRIP_AMOUNT * 2n);
    });

    it("Should track total claimed per user", async function () {
      await faucet.connect(addr1).claim();
      expect(await faucet.totalClaimed(addr1.address)).to.equal(DRIP_AMOUNT);
    });

    it("Should track total distributed", async function () {
      await faucet.connect(addr1).claim();
      await faucet.connect(addr2).claim();
      expect(await faucet.totalDistributed()).to.equal(DRIP_AMOUNT * 2n);
    });
  });

  describe("Leaderboard", function () {
    it("Should return top claimers", async function () {
      await faucet.connect(addr1).claim();
      await faucet.connect(addr2).claim();
      
      const [addresses, amounts] = await faucet.getLeaderboard(10);
      expect(addresses.length).to.equal(2);
      expect(amounts.length).to.equal(2);
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update config", async function () {
      const newDrip = ethers.parseEther("200");
      const newCooldown = 43200; // 12 hours
      
      await faucet.updateConfig(newDrip, newCooldown);
      
      expect(await faucet.dripAmount()).to.equal(newDrip);
      expect(await faucet.cooldownTime()).to.equal(newCooldown);
    });

    it("Should not allow non-owner to update config", async function () {
      await expect(
        faucet.connect(addr1).updateConfig(DRIP_AMOUNT, COOLDOWN_TIME)
      ).to.be.reverted;
    });
  });

  describe("Emergency Withdrawal", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const withdrawAmount = ethers.parseEther("1000");
      await faucet.emergencyWithdraw(owner.address, withdrawAmount);
      
      expect(await bodduToken.balanceOf(owner.address)).to.be.gte(withdrawAmount);
    });
  });

  describe("Refill", function () {
    it("Should allow anyone to refill faucet", async function () {
      const refillAmount = ethers.parseEther("5000");
      
      // First transfer tokens to addr1
      await bodduToken.transfer(addr1.address, refillAmount);
      
      // Approve faucet to spend
      await bodduToken.connect(addr1).approve(await faucet.getAddress(), refillAmount);
      
      // Refill
      await faucet.connect(addr1).refill(refillAmount);
      
      expect(await faucet.getFaucetBalance()).to.equal(FAUCET_FUNDING + refillAmount);
    });
  });
});
