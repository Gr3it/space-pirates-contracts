const fs = require("fs");

const { ethers } = require("hardhat");

const stakingContractSetup = require("./setupScripts/stakingContract");
const splitContractSetup = require("./setupScripts/splitContract");
const faucetContractSetup = require("./setupScripts/faucetContract");
const factoryContractSetup = require("./setupScripts/factoryContract");
const masterChefContractSetup = require("./setupScripts/masterChefContract");
const wrapperContractSetup = require("./setupScripts/wrapperContract");
const questRedeemContractSetup = require("./setupScripts/questRedeemContract");
const battleFieldContractSetup = require("./setupScripts/battleFieldContract");
const itemsMarketPlaceSetup = require("./setupScripts/itemsMarketPlace");
const nftCollectionContractSetup = require("./setupScripts/nftCollection");
const nftStarterContractSetup = require("./setupScripts/nftStarter");

async function main() {
  /* CONTRACT PARAMETERS */
  const addresses = await ethers.getSigners();
  const devAddress = await addresses[0].getAddress();
  const feeAddress = "0x0000000000000000000000000000000000000000";
  const doubloonsPerBlock = "100"; //to convert to ethers (18 decimals)
  const startBlock = 0;
  const BFMintStart = 1669766400; // 2023/1/1
  const BFMintDuration = 31536000; // 1 year

  /* CONTRACTS CREATION */
  const TokensContract = await ethers.getContractFactory("SpacePiratesTokens");

  const StakingContract = await ethers.getContractFactory(
    "SpacePiratesStaking"
  );

  const SplitContract = await ethers.getContractFactory(
    "AsteroidsSplitContract"
  );

  const FaucetContract = await ethers.getContractFactory("SpacePiratesFaucet");

  const WrapperContract = await ethers.getContractFactory(
    "SpacePiratesWrapper"
  );

  const FactoryContract = await ethers.getContractFactory(
    "SpacePiratesFactory"
  );

  const RouterContract = await ethers.getContractFactory("SpacePiratesRouter");

  const MasterChefContract = await ethers.getContractFactory(
    "SpacePiratesMasterChef"
  );

  const QuestRedeemContract = await ethers.getContractFactory(
    "SpacePiratesQuestRedeem"
  );
  const BattleFieldMintContract = await ethers.getContractFactory(
    "BattleFieldFirstCollection"
  );

  const ItemsMarketPlace = await ethers.getContractFactory(
    "SpacePiratesItemsMarketPlace"
  );

  const NFTContract = await ethers.getContractFactory("SpacePiratesNFT");

  const NFTCollectionContract = await ethers.getContractFactory(
    "NFTCollectionFactory"
  );

  const NFTStarterContract = await ethers.getContractFactory(
    "NFTStarterBanner"
  );

  /* CONTRACTS DEPLOY */
  console.log("\nDeploying contracts...\n");

  const tokensContract = await TokensContract.deploy("testUri.com/token/");
  await tokensContract.deployed();
  console.log("Space Pirates Tokens deployed to:", tokensContract.address);

  const stakingContract = await StakingContract.deploy(tokensContract.address);
  await stakingContract.deployed();
  console.log("Space Pirates Staking deployed to:", stakingContract.address);

  const splitContract = await SplitContract.deploy(tokensContract.address);
  await splitContract.deployed();
  console.log("Asteroids Split Contract deployed to:", splitContract.address);

  const faucetContract = await FaucetContract.deploy(tokensContract.address);
  await faucetContract.deployed();
  console.log("Faucet Contract deployed to:", faucetContract.address);

  const wrapperContract = await WrapperContract.deploy(tokensContract.address);
  await wrapperContract.deployed();
  console.log("Wrapper Contract deployed to:", wrapperContract.address);

  const factoryContract = await FactoryContract.deploy(tokensContract.address);
  await factoryContract.deployed();
  console.log("Factory Contract deployed to:", factoryContract.address);

  const routerContract = await RouterContract.deploy(
    factoryContract.address,
    tokensContract.address,
    wrapperContract.address
  );
  await routerContract.deployed();
  console.log("Router Contract deployed to:", routerContract.address);

  const masterChefContract = await MasterChefContract.deploy(
    tokensContract.address,
    devAddress,
    feeAddress,
    ethers.utils.parseUnits(doubloonsPerBlock, 18),
    startBlock
  );
  await masterChefContract.deployed();
  console.log("MasterChef Contract deployed to:", masterChefContract.address);

  const questRedeemContract = await QuestRedeemContract.deploy(
    tokensContract.address
  );
  await questRedeemContract.deployed();
  console.log(
    "Quest Redeem Contract deployed to:",
    questRedeemContract.address
  );

  const battleFieldMintContract = await BattleFieldMintContract.deploy(
    tokensContract.address,
    BFMintStart,
    BFMintDuration
  );
  await battleFieldMintContract.deployed();
  console.log("BFMint Contract deployed to:", battleFieldMintContract.address);

  const itemsMarketPlace = await ItemsMarketPlace.deploy(
    tokensContract.address
  );
  await itemsMarketPlace.deployed();
  console.log("Market Place Contract deployed to:", itemsMarketPlace.address);

  const nftContract = await NFTContract.deploy(
    "https://metadata.space-pirates-testnet.com/familiars/"
  );
  await nftContract.deployed();
  console.log("NFT Contract deployed to:", nftContract.address);

  const nftCollectionContract = await NFTCollectionContract.deploy(
    tokensContract.address,
    nftContract.address
  );
  await nftCollectionContract.deployed();
  console.log(
    "NFT Collection Factory Contract deployed to:",
    nftCollectionContract.address
  );

  const nftStarterContract = await NFTStarterContract.deploy(
    tokensContract.address,
    nftContract.address
  );
  await nftStarterContract.deployed();
  console.log(
    "NFT Starter Collection Contract deployed to:",
    nftStarterContract.address
  );

  /* CONTRACTS SETUP */
  console.log("\nContracts setup...\n");

  await stakingContractSetup(tokensContract, stakingContract);
  await splitContractSetup(tokensContract, splitContract);
  await faucetContractSetup(tokensContract, faucetContract);
  await factoryContractSetup(factoryContract);
  await masterChefContractSetup(
    tokensContract,
    masterChefContract,
    factoryContract
  );
  await wrapperContractSetup(tokensContract, wrapperContract);
  await questRedeemContractSetup(tokensContract, questRedeemContract);
  await battleFieldContractSetup(tokensContract, battleFieldMintContract);
  await itemsMarketPlaceSetup(tokensContract, questRedeemContract);
  await nftCollectionContractSetup(
    tokensContract,
    nftContract,
    nftCollectionContract
  );
  await nftStarterContractSetup(
    tokensContract,
    nftContract,
    nftStarterContract
  );

  let deployAddresses = JSON.stringify({
    tokensContract: tokensContract.address,
    stakingContract: stakingContract.address,
    splitContract: splitContract.address,
    faucetContract: faucetContract.address,
    wrapperContract: wrapperContract.address,
    factoryContract: factoryContract.address,
    routerContract: routerContract.address,
    masterChefContract: masterChefContract.address,
    questRedeemContract: questRedeemContract.address,
    battleFieldContract: battleFieldMintContract.address,
    itemsMarketPlace: itemsMarketPlace.address,
    nftContract: nftContract.address,
    nftCollectionContract: nftCollectionContract.address,
    nftStarterContract: nftStarterContract.address,
  });
  fs.writeFileSync("constants.json", deployAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
