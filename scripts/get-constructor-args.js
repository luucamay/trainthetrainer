// Generate constructor arguments for manual verification
import { ethers } from "ethers";

const abiCoder = new ethers.utils.AbiCoder();
const constructorArgs = abiCoder.encode(
  ["address", "address", "address"],
  [
    "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC
    "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave Pool
    "0x9c6bd82629e7039f1308a56508636e3e425576bf"  // Education Fund
  ]
);

console.log("Constructor Arguments (ABI-encoded):");
console.log(constructorArgs.slice(2)); // Remove 0x prefix

console.log("\nOr individual arguments:");
console.log("1. USDC Address: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8");
console.log("2. Aave Pool: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951");
console.log("3. Education Fund: 0x9c6bd82629e7039f1308a56508636e3e425576bf");