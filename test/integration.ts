import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'

import Web3 from 'web3'
import { BadgerSystem } from '../deploy/BadgerSystem'
import config, { SystemConfig } from '../deploy/badgerConfig'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getSnapshot, BadgerSnapshot } from '../deploy/snapshot'
import { exportSnapshot, formatSnapshot } from '../deploy/io/writeSnapshot'
import { compareSnapshotToDeploy } from '../deploy/shapshotTest'
import { Signer, Wallet, Contract, utils } from 'ethers'
export const colors = require('colors/safe')
import { expect } from 'chai'
import { loadSystem } from '../deploy/loadSystem'
import { setEvmSnapshot } from './helpers/ethSnapshot'

import IERC20 from '../dependency-artifacts/rebase-oracle/IERC20.json'
import { verifyOwnershipPermissions } from './helpers/ownership'
import { getCurrentTimestamp, setNextBlockTimestamp } from './helpers/time'
import { supplyAssetsToStakers, StakingAction, StakingActions } from './helpers/staking'
import { revertEvmSnapshot } from './helpers/ethSnapshot'
import { deploySystem } from '../deploy/deploySystem'

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

const GANACHE_KEYS = [
  '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
  '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
  '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
  '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913',
  '0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743',
  '0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd',
  '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
  '0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3',
  '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4',
  '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
]

describe('Greeter', function() {
  this.timeout(0)

  let badger: BadgerSystem
  let deployConfig: SystemConfig
  let deploySnapshot: BadgerSnapshot

  let provider

  let postDeployEvmSnap
  let deployer
  let whaleOnePool
  let minnowOnePool
  let whaleMultiPool
  let minnowMultiPool
  let stakeFlipFlopper
  let badActor

  let wallets: Wallet[]

  before(async function() {
    console.log(0)
    provider = ethers.provider
    const url = provider.connection.url

    const signers = await ethers.getSigners()

    wallets = [] as Wallet[]

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < GANACHE_KEYS.length; i++) {
      const key = GANACHE_KEYS[i]
      let wallet = new Wallet(key)
      wallet = wallet.connect(provider)
      wallets.push(wallet)
      const tx = {
        to: await wallet.getAddress(),
        value: ethers.utils.parseEther('10.0')
      }
      await (await signers[i].sendTransaction(tx)).wait()
    }

    deployer = wallets[0]
    whaleOnePool = wallets[1]
    minnowOnePool = wallets[2]
    whaleMultiPool = wallets[3]
    minnowMultiPool = wallets[4]
    stakeFlipFlopper = wallets[5]
    badActor = wallets[6]

    const addresses = {
      deployer: await deployer.getAddress(),
      whaleOnePool: await whaleOnePool.getAddress(),
      minnowOnePool: await minnowOnePool.getAddress(),
      whaleMultiPool: await whaleMultiPool.getAddress(),
      minnowMultiPool: await minnowMultiPool.getAddress(),
      stakeFlipFlopper: await stakeFlipFlopper.getAddress(),
      badActor: await badActor.getAddress()
    }

    deployer = wallets[0]
    whaleOnePool = wallets[1]
    minnowOnePool = wallets[2]
    whaleMultiPool = wallets[3]
    minnowMultiPool = wallets[4]
    stakeFlipFlopper = wallets[5]
    badActor = wallets[6]

    const contract = new Contract('0x6793E8E0E8ac22d71c65c2bf82e9B142dEf9eCDb', IERC20.abi, deployer)
    const system = await deploySystem(provider, deployer)

    badger = system.badger
    deployConfig = system.config
    deploySnapshot = system.deploySnapshot

    console.log(badger.daoTimelocks.badgerTimelock.address)

    postDeployEvmSnap = await setEvmSnapshot(provider)
  })

  beforeEach(async function() {
    // Revert to post-setup state
    await revertEvmSnapshot(provider, postDeployEvmSnap)
    postDeployEvmSnap = await setEvmSnapshot(provider)
  })

  it("Handle Badger Distribution correctly", async () => {
    expect('Hello, world!').to.equal('Hello, world!')
    console.log('verifyOwnershipPermissions')
    await verifyOwnershipPermissions(badger, badger.badgerDAO.daoAgent, badActor)

    const stakingBeginsTime = badger.config.trancheStart.toNumber()
    console.log('stakingBeginsTime', stakingBeginsTime)

    const currentTime = getCurrentTimestamp()
    console.log('currentTime', currentTime)

    const rebasePossibleTime = deploySnapshot.diggCore.diggToken.rebaseStartTime.toNumber()
    console.log('rebasePossibleTime', rebasePossibleTime)

    await supplyAssetsToStakers(badger, [
      deployer,
      whaleOnePool,
      minnowOnePool,
      whaleMultiPool,
      minnowMultiPool,
      stakeFlipFlopper,
      badActor
    ])

    console.log('post-assets')

    console.log('timestamp')
    await setNextBlockTimestamp(provider, stakingBeginsTime)

    const day1: StakingAction[] = [
      {
        actor: whaleOnePool,
        amount: utils.parseEther('10'),
        pool: badger.badgerDistributionPools.tranches[0].pools[0],
        type: StakingActions.STAKE
      }
    ]

    // Try to withdraw tokens that aren't yours
    // After a tranche
    // Make sure single staker pool has all tokens, minus founder reward
    // Make sure multi staker pool has correct proportion of tokens to all
    // Get all tokens distributed
    // Make sure founder has 10% of all distributed tokens
    // Make sure single trancher has all tokens, minus founder reward
    // Get all tokens distributed
    // Make sure founder has 10% of all distributed tokens

  })


})
