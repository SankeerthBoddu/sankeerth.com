const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting BODDU Coin deployment...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");
  
  // Get deployment parameters from environment
  const INITIAL_SUPPLY = process.env.INITIAL_SUPPLY || 1000000;
  const FAUCET_DRIP_AMOUNT = process.env.FAUCET_DRIP_AMOUNT || 100;
  const FAUCET_COOLDOWN = process.env.FAUCET_COOLDOWN || 86400; // 24 hours
  
  // Deploy BODDUToken
  console.log("Deploying BODDUToken...");
  const BODDUToken = await ethers.getContractFactory("BODDUToken");
  const bodduToken = await BODDUToken.deploy(INITIAL_SUPPLY);
  await bodduToken.waitForDeployment();
  
  const tokenAddress = await bodduToken.getAddress();
  console.log("✅ BODDUToken deployed to:", tokenAddress);
  console.log("   Initial Supply:", INITIAL_SUPPLY, "tokens");
  console.log("   Total Supply:", ethers.formatEther(await bodduToken.totalSupply()), "BDU\n");
  
  // Deploy BODDUFaucet
  console.log("Deploying BODDUFaucet...");
  const dripAmountWei = ethers.parseEther(FAUCET_DRIP_AMOUNT.toString());
  const BODDUFaucet = await ethers.getContractFactory("BODDUFaucet");
  const faucet = await BODDUFaucet.deploy(
    tokenAddress,
    dripAmountWei,
    FAUCET_COOLDOWN
  );
  await faucet.waitForDeployment();
  
  const faucetAddress = await faucet.getAddress();
  console.log("✅ BODDUFaucet deployed to:", faucetAddress);
  console.log("   Drip Amount:", FAUCET_DRIP_AMOUNT, "BDU per claim");
  console.log("   Cooldown:", FAUCET_COOLDOWN / 3600, "hours\n");
  
  // Fund the faucet with 10% of initial supply
  const faucetFunding = ethers.parseEther((INITIAL_SUPPLY * 0.1).toString());
  console.log("Funding faucet with", ethers.formatEther(faucetFunding), "BDU...");
  const fundTx = await bodduToken.transfer(faucetAddress, faucetFunding);
  await fundTx.wait();
  console.log("✅ Faucet funded successfully\n");
  
  // Print deployment summary
  console.log("═══════════════════════════════════════════════════");
  console.log("DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("  BODDUToken:", tokenAddress);
  console.log("  BODDUFaucet:", faucetAddress);
  console.log("\nToken Details:");
  console.log("  Name: BODDU Coin");
  console.log("  Symbol: BDU");
  console.log("  Total Supply:", ethers.formatEther(await bodduToken.totalSupply()), "BDU");
  console.log("  Faucet Balance:", ethers.formatEther(await bodduToken.balanceOf(faucetAddress)), "BDU");
  console.log("\nNext Steps:");
  console.log("  1. Verify contracts on Etherscan:");
  console.log("     npx hardhat verify --network <network> " + tokenAddress + " " + INITIAL_SUPPLY);
  console.log("     npx hardhat verify --network <network> " + faucetAddress + " " + tokenAddress + " " + dripAmountWei + " " + FAUCET_COOLDOWN);
  console.log("  2. Update frontend config with contract addresses");
  console.log("  3. Test faucet claiming functionality");
  console.log("═══════════════════════════════════════════════════\n");
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BODDUToken: {
        address: tokenAddress,
        args: [INITIAL_SUPPLY]
      },
      BODDUFaucet: {
        address: faucetAddress,
        args: [tokenAddress, dripAmountWei.toString(), FAUCET_COOLDOWN]
      }
    }
  };
  
  const deploymentFile = `deployments-${(await ethers.provider.getNetwork()).name}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", deploymentFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
