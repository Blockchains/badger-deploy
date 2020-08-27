import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Web3 from 'web3'
import { BadgerSystem } from './BadgerSystem'
import config from './config'
import { confirmRebaseParams } from './test/rebaseCoreTest'
import dotenv from 'dotenv'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getDeployed } from './existing'

export enum ChainIds {
  MAINNET = 1,
  RINKEBY = 4,
  LOCAL = 31337
}

dotenv.config()
const web3Provider = new HDWalletProvider(
  process.env.MNEMONIC,
  `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
)

async function main() {
  const signers = await ethers.getSigners()
  const provider = await ethers.getDefaultProvider()

  const deployer = signers[0]
  const web3 = new Web3(web3Provider)

  const deployConfig = config.RINKEBY
  deployConfig.network = ChainIds.LOCAL
  const badger = new BadgerSystem(deployConfig, web3, deployer)

  console.log('---Connect or Deploy External Dependencies---')
  await badger.connectOrDeployUniswap()
  await badger.connectOrDeployStakingAssets()

  console.log('---Deploy DAO---')
  await badger.deployDAO()

  console.log('---Deploy DIGG Core---')
  await badger.deployCore()

  console.log('---Deploy DIGG Oracles---')
  await badger.deployDiggOracles()

  console.log('---Initialize DIGG Parameters---')
  await badger.initializeCore()

  console.log('---Deploy Liquidity Pools---')
  await badger.deployUniswapPools()
  await badger.deployBalancerPools()

  console.log('---Deploy Distribution Pools---')
  await badger.deployDistributionPools()

  // Confirm initial setup
  // const currentParams = await getCurrentParams(badger)
  // console.log('Fetched start parameters ✔️')

  // await confirmRebaseParams(deployConfig, currentParams, rebase)
  // console.log('Confirmed start parameters ✔️')

  // Confirm Liquidity pool setup

  // Confirm Distribution pool setup

  /*
    DAO Setup
      Mint initial Badger supply
      Burn minting capability
      Send 50% to distribution pools, send 50% to Agent timelock

    Digg Setup
      Send 50% of supply to distribution pools, send 50% to Agent timelock
  */

  // Transfer to DAO
  // await rebase.transferToDao()
  // console.log('Transfered ownership to DAO ✔️')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
