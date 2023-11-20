const fs = require('fs');

const { ethers } = require("hardhat");

async function main() {
    const addresses = await ethers.getSigners();

    const Erc20TokenContract = await ethers.getContractFactory("Token");

    console.log("\nDeploying contracts...\n");

    const usdtContract = await Erc20TokenContract.deploy("Tether USD", "USDT")
    await usdtContract.deployed()
    console.log("test USDT contract deployed at:", usdtContract.address);

    const usdcContract = await Erc20TokenContract.deploy("USD Coin", "USDC")
    await usdcContract.deployed()
    console.log("test USDC contract deployed at:", usdcContract.address);

    let deployAddresses = JSON.stringify({
        usdt: usdtContract.address,
        usdc: usdcContract.address
    })
    fs.writeFileSync("testErc20Addresses.json", deployAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
