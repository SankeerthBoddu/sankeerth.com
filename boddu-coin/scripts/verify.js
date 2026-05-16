const { ethers } = require("hardhat");

async function main() {
  console.log("Verifying contracts on Etherscan...\n");
  
  // Load deployment info
  const fs = require('fs');
  const network = (await ethers.provider.getNetwork()).name;
  const deploymentFile = `deployments-${network}.json`;
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found:", deploymentFile);
    console.error("Please deploy contracts first using: npm run deploy:<network>");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log("Network:", network);
  console.log("Token Address:", deploymentInfo.contracts.BODDUToken.address);
  console.log("Faucet Address:", deploymentInfo.contracts.BODDUFaucet.address);
  console.log("\nVerifying BODDUToken...");
  
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contracts.BODDUToken.address,
      constructorArguments: deploymentInfo.contracts.BODDUToken.args,
    });
    console.log("✅ BODDUToken verified!");
  } catch (error) {
    console.log("❌ BODDUToken verification failed:", error.message);
  }
  
  console.log("\nVerifying BODDUFaucet...");
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contracts.BODDUFaucet.address,
      constructorArguments: deploymentInfo.contracts.BODDUFaucet.args,
    });
    console.log("✅ BODDUFaucet verified!");
  } catch (error) {
    console.log("❌ BODDUFaucet verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
