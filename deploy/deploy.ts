import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Web3 from 'web3'
import { BadgerSystem } from './BadgerSystem'
import config from './badgerConfig'
import { confirmRebaseParams } from './test/rebaseCoreTest'
import dotenv from 'dotenv'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getSnapshot } from './snapshot'
import { formatSnapshot } from './snapshotDisplay'
import { compareSnapshotToDeploy } from './shapshotTest'
export const colors = require('colors/safe')

colors.setTheme({
  title: ['green', 'bold'],
  testTitle: ['cyan', 'bold'],
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
})

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

  console.log(colors.title('---Connect or Deploy External Dependencies---'))
  await badger.connectOrDeployUniswap()
  await badger.connectOrDeployStakingAssets()
  console.log('')

  console.log(colors.title('---Deploy DAO---'))
  await badger.deployDAO()
  console.log('')

  console.log(colors.title('---Deploy DIGG Core---'))
  await badger.deployCore()
  console.log('')

  console.log(colors.title('---Deploy DIGG Oracles---'))
  await badger.deployDiggOracles()
  console.log('')

  console.log(colors.title('---Initialize DIGG Parameters---'))
  await badger.initializeCore()
  console.log('')

  console.log(colors.title('---Deploy Liquidity Pools---'))
  await badger.deployUniswapPools()
  await badger.deployBalancerPools()
  console.log('')

  console.log(colors.title('---Deploy Distribution Pools---'))
  await badger.deployDistributionPools()
  console.log('')

  console.log(colors.title('---Deploy DAO Token TimeLocks---'))
  await badger.deployTokenTimelocks()

  console.log(colors.yellow('\nBadger Deploy Complete') + ' 💪\n')

  console.log(colors.testTitle('---Confirm Deployment Parameters---'))
  const postDeploySnapshot = await getSnapshot(badger)
  compareSnapshotToDeploy(badger, postDeploySnapshot, deployConfig)
  console.log(formatSnapshot(postDeploySnapshot))
  console.log(colors.yellow('Badger Deploy Initial Snapshot Confirmed ✅'))

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

  return {badger, postDeploySnapshot, config};
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
