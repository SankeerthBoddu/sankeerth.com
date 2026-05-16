const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BODDUToken", function () {
  let bodduToken;
  let owner;
  let addr1;
  let addr2;
  const INITIAL_SUPPLY = 1000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const BODDUToken = await ethers.getContractFactory("BODDUToken");
    bodduToken = await BODDUToken.deploy(INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await bodduToken.name()).to.equal("BODDU Coin");
      expect(await bodduToken.symbol()).to.equal("BDU");
    });

    it("Should mint initial supply to deployer", async function () {
      const expectedSupply = ethers.parseEther(INITIAL_SUPPLY.toString());
      expect(await bodduToken.totalSupply()).to.equal(expectedSupply);
      expect(await bodduToken.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should have 18 decimals", async function () {
      expect(await bodduToken.decimals()).to.equal(18);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await bodduToken.mint(addr1.address, mintAmount);
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        bodduToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await bodduToken.balanceOf(owner.address);
      
      await bodduToken.burn(burnAmount);
      
      expect(await bodduToken.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await bodduToken.transfer(addr1.address, transferAmount);
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(transferAmount);
      
      await bodduToken.connect(addr1).transfer(addr2.address, transferAmount);
      expect(await bodduToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(0);
    });
  });
});
