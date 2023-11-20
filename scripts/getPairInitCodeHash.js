const fs = require('fs');

const { ethers } = require("hardhat");

async function main() {
    const addresses = await ethers.getSigners();
    const devAddress = await addresses[0].getAddress();

    const HelperDexContract = await ethers.getContractFactory("HelperDexContract");

    console.log("\nDeploying contracts...\n");

    const helperDexContract = await HelperDexContract.deploy()
    await helperDexContract.deployed()
    console.log("test USDT contract deployed at:", helperDexContract.address);

    const bytecode = await helperDexContract.getPairInitCodeHash();

    let deployAddresses = JSON.stringify({
        address: helperDexContract.address,
        bytecode: bytecode,
    })
    fs.writeFileSync("bytecode.json", deployAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
