// Custom verification using ethers and Etherscan API
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function verifyContract() {
  const contractAddress = "0x017C6C1455819F0051614bc11fB247dD6AF249E8";
  const apiKey = process.env.ETHERSCAN_API_KEY;
  
  if (!apiKey) {
    console.log("❌ ETHERSCAN_API_KEY not found");
    return;
  }
  
  console.log("🔄 Attempting contract verification...");
  console.log("📍 Contract:", contractAddress);
  
  // Read the contract source
  const contractPath = path.join(process.cwd(), "contracts/EducationVault.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");
  
  // Encode constructor arguments
  const abiCoder = new ethers.utils.AbiCoder();
  const constructorArgs = abiCoder.encode(
    ["address", "address", "address"],
    [
      "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC
      "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave Pool
      "0x9c6bd82629e7039f1308a56508636e3e425576bf"  // Education Fund
    ]
  );
  
  // Remove the 0x prefix for Etherscan
  const constructorArgsHex = constructorArgs.slice(2);
  
  console.log("📋 Verification details:");
  console.log("- Constructor args (encoded):", constructorArgsHex);
  
  // Prepare the verification payload
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
    console.log("📤 Submitting to Etherscan...");
    const response = await fetch("https://api.etherscan.io/v2/api?chainid=11155111", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });
    
    const result = await response.json();
    
    if (result.status === "1") {
      console.log("✅ Verification submitted successfully!");
      console.log("📋 GUID:", result.result);
      console.log("⏳ Check status in a few minutes at:");
      console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      console.log("❌ Verification failed:");
      console.log(result.result);
    }
  } catch (error) {
    console.error("❌ Error during verification:", error.message);
  }
}

verifyContract();