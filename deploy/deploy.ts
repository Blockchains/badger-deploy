import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Web3 from 'web3'
import { RebaseSystem } from './RebaseSystem'
import config from './config'
import { confirmRebaseParams } from './test/rebaseCoreTest'
import dotenv from 'dotenv'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getDeployed } from './existing'

export const network = 'rinkeby'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

dotenv.config()
const web3Provider = new HDWalletProvider(
  process.env.MNEMONIC,
  `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
)

async function main() {
  const signers = await ethers.getSigners()
  const provider = await ethers.getDefaultProvider(network)

  console.log('Network: ', provider.network.name)
  const deployer = signers[0]

  const web3 = new Web3(web3Provider)

  const deployConfig = config.RINKEBY
  const rebase = new RebaseSystem()

  // Initial Deploy
  await rebase.deploySystem(deployConfig, web3, deployer)
  await rebase.deployDataSources(web3, deployConfig, deployer)

  // Already Deployed
  // const deployment = getDeployed(network)
  // await rebase.connectToSystem(deployment, deployer)

  await rebase.initializeSupplyPolicy(deployConfig, web3, deployer)
  await rebase.initializeSystem(deployConfig, web3, deployer)

  // Deploy liquidity pool
  // await rebase.deployUniswapPool(deployer);
  // rebase.toJson(network)

  // Deploy Geyser
  // await rebase.deployGeyser(deployConfig, deployer);
  // rebase.toJson(network)

  // Confirm initial setup
  // const currentParams = await rebase.getCurrentParams()
  // console.log('Fetched start parameters ✔️')

  // await confirmRebaseParams(deployConfig, currentParams, rebase)
  // console.log('Confirmed start parameters ✔️')

  // Confirm Geyser setup

  // Distribute BASE and gBASE tokens to contributors via TokenRequestApp

  // Lock gBASE in Geyser

  // Fund liquidity pool

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
