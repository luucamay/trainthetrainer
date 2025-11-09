import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Starting deployment to Sepolia...");
  
  // Sepolia testnet addresses
  const usdcAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // Sepolia USDC
  const aavePoolAddress = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool Sepolia
  const educationFundAddress = process.env.EDUCATION_FUND_ADDRESS || "0x9c6bd82629e7039f1308a56508636e3e425576bf";

  console.log("📝 Constructor parameters:");
  console.log("  USDC Address:", usdcAddress);
  console.log("  Aave Pool:", aavePoolAddress);
  console.log("  Education Fund:", educationFundAddress);

  // Get the contract factory
  const EducationVault = await hre.ethers.getContractFactory("EducationVault");
  
  console.log("📦 Deploying contract...");
  
  // Deploy the contract
  const vault = await EducationVault.deploy(
    usdcAddress,
    aavePoolAddress,
    educationFundAddress
  );

  // Wait for deployment
  await vault.waitForDeployment();
  
  const contractAddress = await vault.getAddress();

  console.log("✅ EducationVault deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Update src/lib/contracts.ts:");
  console.log(`   EDUCATION_VAULT: '${contractAddress}' as \`0x\${string}\`,`);
  console.log("");
  console.log("2. Verify on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress} "${usdcAddress}" "${aavePoolAddress}" "${educationFundAddress}"`);

  return contractAddress;
}

// Execute deployment
main()
  .then(() => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });