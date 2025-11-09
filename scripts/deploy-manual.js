// Simple deployment script that works with current setup
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("🚀 Starting deployment to Sepolia...");
  
  // Check if we have a private key
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment var    npx hardhat verify --network sepolia 0x017C6C1455819F0051614bc11fB247dD6AF249E8 "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8" "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" "0x9c6bd82629e7039f1308a56508636e3e425576bf"iable is required");
  }
  
  // Ensure private key has 0x prefix
  const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : '0x' + process.env.PRIVATE_KEY;
  
  // Setup provider and signer
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"
  );
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("📍 Deploying from account:", wallet.address);
  
  // Load contract ABI and bytecode
  const contractPath = path.join(process.cwd(), "artifacts/contracts/EducationVault.sol/EducationVault.json");
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  
  // Create contract factory
  const EducationVault = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  
  // Constructor parameters
  const usdcAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // Sepolia USDC
  const aavePoolAddress = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Aave Pool Sepolia
  const educationFundAddress = process.env.EDUCATION_FUND_ADDRESS || "0x9c6bd82629e7039f1308a56508636e3e425576bf";
  
  console.log("📝 Constructor parameters:");
  console.log("  USDC Address:", usdcAddress);
  console.log("  Aave Pool:", aavePoolAddress);
  console.log("  Education Fund:", educationFundAddress);
  
  console.log("📦 Deploying contract...");
  
  // Deploy the contract
  const vault = await EducationVault.deploy(
    usdcAddress,
    aavePoolAddress,
    educationFundAddress
  );
  
  console.log("⏳ Waiting for deployment confirmation...");
  await vault.deployed();
  
  console.log("✅ EducationVault deployed successfully!");
  console.log("📍 Contract Address:", vault.address);
  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Update src/lib/contracts.ts:");
  console.log(`   EDUCATION_VAULT: '${vault.address}' as \`0x\${string}\`,`);
  console.log("");
  console.log("2. Verify on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${vault.address} "${usdcAddress}" "${aavePoolAddress}" "${educationFundAddress}"`);
  
  return vault.address;
}

main()
  .then((address) => {
    console.log("🎉 Deployment completed successfully!");
    console.log("Contract deployed at:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });