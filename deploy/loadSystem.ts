import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'

import Web3 from 'web3'
import { BadgerSystem } from './BadgerSystem'
import config, { SystemConfig } from './badgerConfig'
import dotenv from 'dotenv'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getSnapshot, BadgerSnapshot } from './snapshot'
import { exportSnapshot, formatSnapshot } from './io/writeSnapshot'
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

export async function loadSystem(): Promise<{
  badger: BadgerSystem
  deploySnapshot: BadgerSnapshot
  config: SystemConfig
}> {
  const signers = await ethers.getSigners()

  const jsonRpcProvider = ethers.provider
  const url = jsonRpcProvider.connection.url
  console.log(`Connected to Node @ ${url}`)

  const web3Provider = new HDWalletProvider(process.env.MNEMONIC, url)
  const web3 = new Web3(web3Provider)

  const deployer = signers[0]

  const deployConfig = config.RINKEBY
  deployConfig.network = ChainIds.LOCAL
  const badger = new BadgerSystem(deployConfig, web3, deployer)

  console.log(colors.title('---Connect or Deploy External Dependencies---'))
  // await badger.loadFromFile(path)

  console.log(colors.testTitle('---Confirm Deployment Parameters---'))
  const deploySnapshot = await getSnapshot(badger)
  compareSnapshotToDeploy(badger, deploySnapshot, deployConfig)
  console.log(colors.yellow('Badger Deploy Initial Snapshot Confirmed ✅'))

  exportSnapshot(deploySnapshot)
  console.log(colors.green('Snapshot written to disk /instances/local'))

  return { badger, deploySnapshot, config: deployConfig }
}