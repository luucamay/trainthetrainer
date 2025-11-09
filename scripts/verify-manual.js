// Manual verification script
import fetch from 'node-fetch';
import fs from 'fs';

async function verifyContract() {
  const contractAddress = "0x017C6C1455819F0051614bc11fB247dD6AF249E8";
  const apiKey = process.env.ETHERSCAN_API_KEY;
  
  if (!apiKey) {
    console.log("❌ ETHERSCAN_API_KEY not found in environment variables");
    console.log("📋 Manual verification steps:");
    console.log("1. Visit: https://sepolia.etherscan.io/address/" + contractAddress);
    console.log("2. Click 'Contract' tab > 'Verify and Publish'");
    console.log("3. Use these settings:");
    console.log("   - Compiler: v0.8.20");
    console.log("   - License: MIT");
    console.log("   - Optimization: No");
    console.log("4. Paste the contract source code from contracts/EducationVault.sol");
    console.log("5. Constructor arguments:");
    console.log("   - USDC: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8");
    console.log("   - Aave Pool: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951");
    console.log("   - Education Fund: 0x9c6bd82629e7039f1308a56508636e3e425576bf");
    return;
  }
  
  // Read contract source
  const contractSource = fs.readFileSync('./contracts/EducationVault.sol', 'utf8');
  
  const verificationData = {
    apikey: apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode: contractSource,
    codeformat: 'solidity-single-file',
    contractname: 'EducationVault',
    compilerversion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: '0',
    runs: '200',
    constructorArguements: '', // Will need to encode these properly
  };
  
  console.log("🔄 Attempting to verify contract...");
  console.log("📍 Contract:", contractAddress);
  console.log("📋 For now, please use manual verification via Etherscan website.");
}

verifyContract().catch(console.error);