const { expect } = require("chai");
const { ethers } = require("hardhat");

let tokens;
let staking;
let helperContract;

let owner;
let addr1;
let addr2;
let addrs;

// token IDs
let doubloons;
let asteroids;

describe.only("SpacePiratesStaking: basic features", () => {
  before(async () => {
    const Tokens = await ethers.getContractFactory("SpacePiratesTokens");
    const Staking = await ethers.getContractFactory("SpacePiratesStaking");
    const HelperRoleContract = await ethers.getContractFactory(
      "HelperRoleContract"
    );

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    tokens = await Tokens.deploy("");
    staking = await Staking.deploy(tokens.address);
    helperContract = await HelperRoleContract.deploy();

    await staking.setFeeAddress(owner.address);

    // get tokencIDs
    doubloons = await tokens.DOUBLOONS();
    asteroids = await tokens.ASTEROIDS();

    // grant DOUBLOONS_MINTER_ROLE to staking contract
    let DOUBLOONS_MINTER_ROLE = await helperContract.getMintRoleBytes(
      doubloons
    );
    await tokens.grantRole(DOUBLOONS_MINTER_ROLE, staking.address);
  });

  it("should create a new staking pair", async () => {
    const index = await staking.poolLength();

    await staking.createStakingPool(doubloons, doubloons, 10, 100);

    const {tokenId, rewardTokenId, rewardRate, depositFee} =
      await staking.stakingPools(index);

    expect(tokenId).to.equal(doubloons);
    expect(rewardTokenId).to.equal(doubloons);
    expect(rewardRate).to.be.equal(10);
    expect(depositFee).to.be.equal(100);
  });

  it("should stake a token", async () => {
    const index = await staking.poolLength() - 1;
    const depositFee = 100;

    // grant DOUBLOONS_MINTER_ROLE to owner to transfer assets to addr1
    const DOUBLOONS_MINTER_ROLE = await helperContract.getMintRoleBytes(
      doubloons
    );
    await tokens.grantRole(DOUBLOONS_MINTER_ROLE, owner.address);
    await tokens.mint(addr1.address, doubloons, 10000);

    // addr1 approve staking contract to operate on tokens
    await tokens.connect(addr1).setApprovalForAll(staking.address, true);

    let userBalance = await tokens.balanceOf(addr1.address, doubloons);
    let ownerBalance = await tokens.balanceOf(owner.address, doubloons);

    await staking.connect(addr1).stake(index, 1000);

    // addr1 balance should be equal to previous balance - 1000
    expect(await tokens.balanceOf(addr1.address, doubloons)).to.equal(
      userBalance - 1000
    );

    // totalSupply of staked doubloons should be equal to 1000 - depositFee value
    expect((await staking.stakingPools(index))[5]).to.equal(
      1000 - (1000 * depositFee) / 10000
    );

    // owner balance should increase for an amount equal to depositFee
    expect(await tokens.balanceOf(owner.address, doubloons)).to.gt(
      ownerBalance
    );
  });

  it("should withdraw a staked token", async () => {
    let userBalance = await tokens.balanceOf(addr1.address, doubloons);
    const index = await staking.poolLength() - 1;


    let prevSupply = (await staking.stakingPools(index))[5];

    await staking.connect(addr1).unstake(index, 300);

    // addr1 balance should be bigger after the withdraw
    expect(await tokens.balanceOf(addr1.address, doubloons)).to.gt(userBalance);

    // totalSupply should be smaller
    expect((await staking.stakingPools(index))[5]).to.lt(prevSupply);
  });

  it("should harvest rewards", async () => {
    const index = await staking.poolLength() - 1;
    let userBalance = await tokens.balanceOf(addr1.address, doubloons);

    await staking.connect(addr1).getReward(index);

    // addr1 doubloons balance should be bigger after harvest of rewards
    expect(await tokens.balanceOf(addr1.address, doubloons)).to.gt(userBalance);
  });

  it("should update an existing staking pair", async () => {
    // change stakingTokenId to asteroids
    const index = await staking.poolLength() - 1;
    await staking.updateStakingPool(index, 10, 100);

    let {rewardTokenId, rewardRate, depositFee} =
      await staking.stakingPools(index);

    expect(rewardRate).to.be.equal(10);
    expect(depositFee).to.be.equal(100);
  });
});
