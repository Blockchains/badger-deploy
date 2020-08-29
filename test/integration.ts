import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import Web3 from 'web3'
import { BadgerSystem } from '../deploy/BadgerSystem'
import { main } from '../deploy/deploy'
import dotenv from 'dotenv'
const HDWalletProvider = require('truffle-hdwallet-provider')
import { getSnapshot } from '../deploy/snapshot'
import { formatSnapshot } from '../deploy/snapshotDisplay'
import { compareSnapshotToDeploy } from '../deploy/shapshotTest'
export const colors = require('colors/safe')

import { expect } from 'chai'

describe('Greeter', async () => {
  const { badger, postDeploySnapshot, config } = await main()

  const [
    deployer,
    whaleOnePool,
    minnowOnePool,
    whaleMultiPool,
    minnowMultiPool,
    stakeFlipFlopper,
    badActor
  ] = await ethers.getSigners()

  it('Should not allow non-owners to change system properties', async () => {})
  it('Should not allow staking in pools before start time', async () => {})
  it('Should distribute the correct amount of rewards after day 1', async () => {})
  it('Should distribute the correct amount of rewards after day 2', async () => {})
  it('Should distribute the correct amount of rewards after day 3', async () => {})
  it('Should distribute the correct amount of rewards after day 4', async () => {})
  it('Should not allow staking in pools that have not started', async () => {})
  it('Should distribute the correct amount of rewards after day 5', async () => {})
  it('Should distribute the correct amount of rewards after day 6', async () => {})
  it('Should distribute the correct amount of rewards after day 7', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})
  it('Should distribute the correct amount of rewards after day 14', async () => {})

  it('Should distribute the correct amount of rewards after day 14', async () => {})
})
