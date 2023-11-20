const { ethers } = require("hardhat");

const {
  factoryContract,
  tokensContract,
  wrapperContract,
} = require("../constants.json");

async function main() {
  const addresses = await ethers.getSigners();
  const devAddress = await addresses[0].getAddress();

  const RouterContract = await ethers.getContractFactory("SpacePiratesRouter");

  console.log("\nDeploying contracts...\n");

  const routerContract = await RouterContract.deploy(
    factoryContract,
    tokensContract,
    wrapperContract
  );
  await routerContract.deployed();
  console.log("Router Contract deployed to:", routerContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
