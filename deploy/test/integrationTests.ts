import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { deploySystem, colors } from '../deploySystem'
import { expect } from 'chai'
import { BadgerSystem, StakingAssets } from '../BadgerSystem'
import { Signer, Contract, BigNumber, utils } from 'ethers'
import { verifyOwnershipPermissions } from './helpers/ownership'
import { getCurrentTimestamp, setNextBlockTimestamp } from './helpers/time'
import { StakingAction, StakingActions, supplyAssetsToStakers } from './helpers/staking'

export async function runIntegrationTests() {
  const jsonRpcProvider = ethers.provider;

  const { badger, deploySnapshot, config } = await deploySystem()
  console.log('yes')

  const [
    deployer,
    whaleOnePool,
    minnowOnePool,
    whaleMultiPool,
    minnowMultiPool,
    stakeFlipFlopper,
    badActor
  ] = await ethers.getSigners()

  const addresses = {
    deployer: await deployer.getAddress(),
    whaleOnePool: await whaleOnePool.getAddress(),
    minnowOnePool: await minnowOnePool.getAddress(),
    whaleMultiPool: await whaleMultiPool.getAddress(),
    minnowMultiPool: await minnowMultiPool.getAddress(),
    stakeFlipFlopper: await stakeFlipFlopper.getAddress(),
    badActor: await badActor.getAddress()
  }

  console.log('verifyOwnershipPermissions')
  await verifyOwnershipPermissions(badger, badger.fakeDAO.daoAgent, badActor)

  const stakingBeginsTime = badger.config.trancheStart.toNumber();
  console.log('stakingBeginsTime', stakingBeginsTime)

  const currentTime = getCurrentTimestamp()
  console.log('currentTime', currentTime)

  const rebasePossibleTime = deploySnapshot.diggCore.diggToken.rebaseStartTime.toNumber()
  console.log('rebasePossibleTime', rebasePossibleTime)


  await setNextBlockTimestamp(jsonRpcProvider, stakingBeginsTime)
  await supplyAssetsToStakers(badger, [
    deployer,
    whaleOnePool,
    minnowOnePool,
    whaleMultiPool,
    minnowMultiPool,
    stakeFlipFlopper,
    badActor
  ])

  const day1: StakingAction[] = [
    {
      actor: whaleOnePool,
      amount: utils.parseEther("10"),
      pool: badger.badgerDistributionPools.tranches[0].pools[0],
      type: StakingActions.STAKE
    }
  ];
}


async function verifyOwnershipTransfers() {}

runIntegrationTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
