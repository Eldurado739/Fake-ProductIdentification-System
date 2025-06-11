const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Fake Product Identification System deployment...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance < ethers.utils.parseEther("0.1")) {
        console.warn("⚠️  Warning: Low balance. Make sure you have enough ETH for deployment.");
    }
    
    console.log("\n📦 Deploying FakeProductIdentification contract...");
    
    // Deploy the main contract
    const FakeProductIdentification = await ethers.getContractFactory("FakeProductIdentification");
    const fakeProductContract = await FakeProductIdentification.deploy();
    
    await fakeProductContract.deployed();
    
    console.log("✅ FakeProductIdentification deployed to:", fakeProductContract.address);
    console.log("🔗 Transaction hash:", fakeProductContract.deployTransaction.hash);
    
    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await fakeProductContract.deployTransaction.wait(3);
    console.log("✅ Contract confirmed!");
    
    // Setup initial configuration
    console.log("\n🔧 Setting up initial configuration...");
    
    try {
        // Add deployer as first authorized verifier
        const authTx = await fakeProductContract.authorizeVerifier(deployer.address);
        await authTx.wait();
        console.log("✅ Deployer authorized as verifier");
        
        // You can add more setup here, like authorizing other addresses
        
    } catch (error) {
        console.error("❌ Error during setup:", error.message);
    }
    
    // Save deployment information
    const deploymentInfo = {
        network: "localhost", // Change this based on your network
        contractAddress: fakeProductContract.address,
        deployerAddress: deployer.address,
        deploymentDate: new Date().toISOString(),
        blockNumber: fakeProductContract.deployTransaction.blockNumber,
        gasUsed: fakeProductContract.deployTransaction.gasLimit.toString(),
        transactionHash: fakeProductContract.deployTransaction.hash
    };
    
    // Create contracts directory if it doesn't exist
    const contractsDir = path.join(__dirname, "../contracts");
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    // Save contract ABI
    const artifactPath = path.join(__dirname, "../artifacts/contracts/Project.sol/FakeProductIdentification.json");
    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        fs.writeFileSync(
            path.join(contractsDir, "FakeProductIdentification.json"),
            JSON.stringify({
                address: fakeProductContract.address,
                abi: artifact.abi
            }, null, 2)
        );
        console.log("✅ Contract ABI saved");
    }
    
    // Save deployment info
    fs.writeFileSync(
        path.join(__dirname, "../deployment-info.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n📋 Deployment Summary:");
    console.log("====================");
    console.log("Contract Address:", fakeProductContract.address);
    console.log("Deployer Address:", deployer.address);
    console.log("Network:", "localhost");
    console.log("Gas Used:", fakeProductContract.deployTransaction.gasLimit.toString());
    console.log("Transaction Hash:", fakeProductContract.deployTransaction.hash);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Verify the contract on block explorer (if on testnet/mainnet)");
    console.log("2. Update the frontend configuration with the contract address");
    console.log("3. Test the contract functionality");
    console.log("4. Register manufacturers and start adding products");
    
    // Verification instructions for different networks
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("\n🔍 To verify on Etherscan, run:");
        console.log(`npx hardhat verify --network ${network.name} ${fakeProductContract.address}`);
    }
}

// Enhanced error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });

// Additional utility functions
async function verifyContract(contractAddress, constructorArgs = []) {
    try {
        console.log("🔍 Verifying contract...");
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contract verified successfully");
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

module.exports = {
    main,
    verifyContract
};
