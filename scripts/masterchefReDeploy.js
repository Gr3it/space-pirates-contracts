const { ethers } = require("hardhat");

const { factoryContract, tokensContract } = require("../constants.json");

async function main() {
  const addresses = await ethers.getSigners();

  const devAddress = await addresses[0].getAddress();
  const feeAddress = "0x0000000000000000000000000000000000000000";
  const doubloonsPerBlock = "100"; //to convert to ethers (18 decimals)
  const startBlock = 0;

  const MasterChefContract = await ethers.getContractFactory(
    "SpacePiratesMasterChef"
  );

  console.log("\nDeploying contracts...\n");

  const masterChefContract = await MasterChefContract.deploy(
    tokensContract,
    devAddress,
    feeAddress,
    ethers.utils.parseUnits(doubloonsPerBlock, 18),
    startBlock
  );
  await masterChefContract.deployed();
  console.log("Masterchef Contract deployed to:", masterChefContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
