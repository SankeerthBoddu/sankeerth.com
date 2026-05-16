const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BODDUTokenV2", function () {
  let bodduToken;
  let owner;
  let addr1;
  let addr2;
  const INITIAL_OWNER_SUPPLY = 1000000; // 1M tokens to owner
  const MINT_PRICE = ethers.parseEther("0.0001");
  const MINT_AMOUNT = ethers.parseEther("1000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const BODDUTokenV2 = await ethers.getContractFactory("BODDUTokenV2");
    bodduToken = await BODDUTokenV2.deploy(INITIAL_OWNER_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await bodduToken.name()).to.equal("BODDU Token");
      expect(await bodduToken.symbol()).to.equal("BDU");
    });

    it("Should mint initial supply to owner", async function () {
      const expectedSupply = ethers.parseEther(INITIAL_OWNER_SUPPLY.toString());
      expect(await bodduToken.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should have correct max PUBLIC supply", async function () {
      expect(await bodduToken.MAX_PUBLIC_SUPPLY()).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Public Minting", function () {
    it("Should allow anyone to mint by paying ETH", async function () {
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
    });

    it("Should reject mint without sufficient ETH", async function () {
      await expect(
        bodduToken.connect(addr1).mint({ value: ethers.parseEther("0.00001") })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("Should track mint count per address", async function () {
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.mintCount(addr1.address)).to.equal(1);
      
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.mintCount(addr1.address)).to.equal(2);
    });

    it("Should enforce max mints per address", async function () {
      // Mint 10 times (max)
      for (let i = 0; i < 10; i++) {
        await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      }
      
      // 11th mint should fail
      await expect(
        bodduToken.connect(addr1).mint({ value: MINT_PRICE })
      ).to.be.revertedWith("Max mints reached for address");
    });

    it("Should refund excess ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      const tx = await bodduToken.connect(addr1).mint({ value: ethers.parseEther("0.001") });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      // Should only have paid mintPrice + gas, not the full 0.001 ETH
      expect(initialBalance - finalBalance).to.be.closeTo(MINT_PRICE + gasUsed, ethers.parseEther("0.0001"));
    });

    it("Should track total minters", async function () {
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      await bodduToken.connect(addr2).mint({ value: MINT_PRICE });
      expect(await bodduToken.totalMinters()).to.equal(2);
      
      // Same address minting again shouldn't increase count
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.totalMinters()).to.equal(2);
    });
  });

  describe("Supply Cap", function () {
    it("Should report public mintable supply correctly", async function () {
      const mintable = await bodduToken.publicMintableSupply();
      const publicMinted = await bodduToken.publicMintedSupply();
      const maxPublic = await bodduToken.MAX_PUBLIC_SUPPLY();
      expect(mintable).to.equal(maxPublic - publicMinted);
    });

    it("Should report mints remaining for address", async function () {
      expect(await bodduToken.mintsRemaining(addr1.address)).to.equal(10);
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.mintsRemaining(addr1.address)).to.equal(9);
    });

    it("Should track public minted supply separately", async function () {
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      expect(await bodduToken.publicMintedSupply()).to.equal(MINT_AMOUNT);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.0005");
      await bodduToken.setMintPrice(newPrice);
      expect(await bodduToken.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to withdraw ETH", async function () {
      // First, collect some ETH from mints
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      await bodduToken.connect(addr2).mint({ value: MINT_PRICE });
      
      const contractBalance = await bodduToken.getContractBalance();
      expect(contractBalance).to.equal(MINT_PRICE * 2n);
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await bodduToken.withdrawETH();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should allow owner to mint unlimited (no cap)", async function () {
      // Mint way more than MAX_PUBLIC_SUPPLY
      const hugeAmount = ethers.parseEther("50000000"); // 50 million
      await bodduToken.ownerMint(addr1.address, hugeAmount);
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(hugeAmount);
    });

    it("Should allow owner to batch mint", async function () {
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("2000");
      
      await bodduToken.ownerMintBatch(
        [addr1.address, addr2.address],
        [amount1, amount2]
      );
      
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(amount1);
      expect(await bodduToken.balanceOf(addr2.address)).to.equal(amount2);
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(
        bodduToken.connect(addr1).withdrawETH()
      ).to.be.reverted;
    });

    it("Should not allow non-owner to owner mint", async function () {
      await expect(
        bodduToken.connect(addr1).ownerMint(addr1.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn", async function () {
      await bodduToken.connect(addr1).mint({ value: MINT_PRICE });
      const burnAmount = ethers.parseEther("500");
      
      await bodduToken.connect(addr1).burn(burnAmount);
      expect(await bodduToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - burnAmount);
    });
  });
});
