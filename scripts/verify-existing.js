// Quick verification test for existing contract
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function verifyExistingContract() {
  const contractAddress = "0x017C6C1455819F0051614bc11fB247dD6AF249E8"; // Your deployed contract
  const apiKey = process.env.ETHERSCAN_API_KEY;
  
  console.log("🔍 Verifying existing contract...");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔑 API Key present:", !!apiKey);
  
  if (!apiKey) {
    console.log("❌ No API key found");
    return;
  }
  
  // First check if contract exists
  console.log("🔄 Checking contract on Etherscan...");
  const checkUrl = `https://api.etherscan.io/v2/api?chainid=11155111`;
  const checkPayload = new URLSearchParams({
    apikey: apiKey,
    module: "contract",
    action: "getabi",
    address: contractAddress
  });
  
  try {
    const checkResponse = await fetch(checkUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: checkPayload,
    });
    
    const checkResult = await checkResponse.json();
    console.log("📋 Contract exists check:", checkResult);
    
    if (checkResult.status === "0" && checkResult.result === "Contract source code not verified") {
      console.log("✅ Contract found but not verified - proceeding with verification...");
      
      // Proceed with verification
      const contractSource = fs.readFileSync("./contracts/EducationVault.sol", "utf8");
      
      const abiCoder = new ethers.utils.AbiCoder();
      const encodedArgs = abiCoder.encode(
        ["address", "address", "address"],
        [
          "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC
          "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave Pool  
          "0x9c6bd82629e7039f1308a56508636e3e425576bf"  // Education Fund
        ]
      );
      const constructorArgsHex = encodedArgs.slice(2);
      
      const verifyPayload = new URLSearchParams({
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
        licenseType: "3"
      });
      
      console.log("📤 Submitting verification...");
      console.log("🔍 Using address:", contractAddress);
      console.log("🔍 Constructor args length:", constructorArgsHex.length);
      
      const verifyResponse = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyPayload,
      });
      
      const verifyResult = await verifyResponse.json();
      console.log("📋 Verification result:", verifyResult);
      
    } else {
      console.log("❌ Unexpected contract status:", checkResult);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

verifyExistingContract();