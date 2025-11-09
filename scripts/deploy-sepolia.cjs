const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying EducationVault to Sepolia...\n");

  // Sepolia testnet addresses
  const usdcAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // Sepolia USDC
  const aavePoolAddress = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool Sepolia
  const educationFundAddress = process.env.EDUCATION_FUND_ADDRESS || "0x1234567890123456789012345678901234567890";

  console.log("📋 Deployment Configuration:");
  console.log("USDC Address:", usdcAddress);
  console.log("Aave Pool:", aavePoolAddress);
  console.log("Education Fund:", educationFundAddress);

  if (educationFundAddress === "0x1234567890123456789012345678901234567890") {
    console.log("\n⚠️  WARNING: Using placeholder education fund address!");
    console.log("   Set EDUCATION_FUND_ADDRESS in your .env file");
  }

  console.log("\n⏳ Deploying contract...");

  const EducationVault = await hre.ethers.getContractFactory("EducationVault");
  const vault = await EducationVault.deploy(
    usdcAddress,
    aavePoolAddress,
    educationFundAddress
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("\n✅ EducationVault deployed!");
  console.log("📍 Contract Address:", vaultAddress);

  console.log("\n📋 Next Steps:");
  console.log("1. Update src/lib/contracts.ts with this address:");
  console.log(`   EDUCATION_VAULT: '${vaultAddress}' as \`0x\${string}\`,`);
  console.log("2. Verify on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${vaultAddress} "${usdcAddress}" "${aavePoolAddress}" "${educationFundAddress}"`);
  console.log("3. Test the frontend with real transactions!");

  // Try to verify automatically if Etherscan API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [usdcAddress, aavePoolAddress, educationFundAddress],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("   You can verify manually later");
    }
  }

  return vaultAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });