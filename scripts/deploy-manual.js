// Simple deployment script that works with current setup
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

async function verifyContract(contractAddress, constructorArgs) {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️  ETHERSCAN_API_KEY not found - skipping verification");
    console.log("📋 Manual verification:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
    return;
  }
  
  console.log("🔍 Starting contract verification...");
  console.log("📍 Contract Address:", contractAddress);
  console.log("📝 Constructor Args:", constructorArgs);
  
  // Verify contract exists on Etherscan first
  console.log("🔄 Checking if contract exists on Etherscan...");
  try {
    const checkUrl = `https://api.etherscan.io/v2/api?chainid=11155111`;
    const checkPayload = new URLSearchParams({
      apikey: apiKey,
      module: "contract",
      action: "getabi",
      address: contractAddress
    });
    
    const checkResponse = await fetch(checkUrl, {
      method: "POST", 
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: checkPayload,
    });
    
    const checkResult = await checkResponse.json();
    console.log("📋 Contract check result:", checkResult.result);
    
  } catch (error) {
    console.log("⚠️  Could not check contract existence:", error.message);
  }
  const contractPath = path.join(process.cwd(), "contracts/EducationVault.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");
  
  // Encode constructor arguments
  const abiCoder = new ethers.utils.AbiCoder();
  const encodedArgs = abiCoder.encode(
    ["address", "address", "address"],
    constructorArgs
  );
  const constructorArgsHex = encodedArgs.slice(2); // Remove 0x prefix
  
  // Prepare verification payload with correct V2 parameters
  const payload = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: contractSource,
    codeformat: "solidity-single-file",
    contractname: "EducationVault",
    compilerversion: "v0.8.20+commit.a1b79de6",
    optimizationUsed: "0",
    runs: "200",
    constructorArguements: constructorArgsHex,
    licenseType: "3" // MIT License
  });
  
  try {
    console.log("📤 Submitting verification to Etherscan V2 API...");
    console.log("🔍 Debug - Payload parameters:", {
      chainid: "11155111",
      contractaddress: contractAddress,
      contractname: "EducationVault",
      compilerversion: "v0.8.20+commit.a1b79de6"
    });
    
    // Build URL with chainid as query parameter
    const url = `https://api.etherscan.io/v2/api?chainid=11155111`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });
    
    const result = await response.json();
    
    if (result.status === "1") {
      const guid = result.result;
      console.log("✅ Verification submitted successfully!");
      console.log("📋 GUID:", guid);
      console.log("⏳ Checking verification status...");
      
      // Poll for verification status
      await checkVerificationStatus(apiKey, guid, contractAddress);
      
    } else {
      console.log("❌ Verification submission failed:", result.result);
      console.log("📋 Try manual verification at:");
      console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }
  } catch (error) {
    console.error("❌ Verification error:", error.message);
    console.log("📋 Try manual verification at:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
  }
}

async function checkVerificationStatus(apiKey, guid, contractAddress) {
  const maxAttempts = 10;
  const delay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Checking verification status (attempt ${attempt}/${maxAttempts})...`);
    
    const statusPayload = new URLSearchParams({
      apikey: apiKey,
      module: "contract",
      action: "checkverifystatus",
      guid: guid
    });
    
    try {
      const url = `https://api.etherscan.io/v2/api?chainid=11155111`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: statusPayload,
      });
      
      const result = await response.json();
      
      if (result.status === "1") {
        if (result.result === "Pass - Verified") {
          console.log("🎉 Contract verification successful!");
          console.log("✅ Contract is now verified on Etherscan:");
          console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
          return;
        } else if (result.result === "Pending in queue") {
          console.log("⏳ Verification pending in queue...");
        } else if (result.result.includes("Fail")) {
          console.log("❌ Verification failed:", result.result);
          console.log("📋 Try manual verification at:");
          console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
          return;
        }
      } else {
        console.log("⚠️  Status check response:", result.result);
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏸️  Waiting ${delay/1000} seconds before next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`❌ Error checking status (attempt ${attempt}):`, error.message);
    }
  }
  
  console.log("⏰ Verification status check timed out.");
  console.log("📋 Check manually at:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
}

async function main() {
  console.log("🚀 Starting deployment to Sepolia...");
  
  // Check if we have a private key
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
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
  
  // Attempt automatic verification
  console.log("🔍 Attempting contract verification...");
  await verifyContract(vault.address, [usdcAddress, aavePoolAddress, educationFundAddress]);
  
  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Update src/lib/contracts.ts:");
  console.log(`   EDUCATION_VAULT: '${vault.address}' as \`0x\${string}\`,`);
  
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