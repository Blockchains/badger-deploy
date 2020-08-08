import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { RebaseSystem } from './RebaseSystem'
import config from './config'
import { confirmRebaseParams } from './test/rebaseCoreTest'

async function main() {
  const signers = await ethers.getSigners()
  const provider = await ethers.getDefaultProvider()

  console.log('Network: ', provider.network.name)
  const deployer = signers[0]
  
  const deployConfig = config.LOCAL;

  // Deploy DAO

  // Deploy Rebase Core (token, supply management, oracles)
  const rebase = new RebaseSystem()
  await rebase.deploySystem(deployConfig, provider, deployer)

  // Transfer to DAO
  console.log('Transfer ownership to DAO...')

  await rebase.transferToSystemOwner()

  // Confirm initial setup
  console.log('Fetch start parameters...')
  const currentParams = await rebase.getCurrentParams();

  console.log('Confirm start parameters...')
  await confirmRebaseParams(deployConfig, currentParams, rebase);

  // Deploy liquidity pool
  // await rebase.deployUniswapPool(deployer);

  // Fund liquidity pool

  // Configure Data Sources
  // await rebase.deployDataSources(deployConfig, deployer);

  // Deploy Geyser

  // Confirm Geyser setup

  // Distribute BASE and gBASE tokens to contributors via TokenRequestApp

  // Lock gBASE in Geyser

  // Fund liquidity pool
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
