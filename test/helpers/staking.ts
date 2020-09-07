import { Signer, Contract, BigNumber, ethers, utils } from 'ethers'
import { BadgerSystem, Pool } from '../../deploy/BadgerSystem'
import { getActivePools, getFuturePools, getCompletedPools, getAllPools } from './poolHelpers'
import { getCurrentTimestamp } from './time'
import { PoolAssets } from '../../deploy/badgerConfig'

export interface Balances {
  [index: string]: BalanceMap
}

export interface BalanceMap {
  [index: string]: BigNumber
}

export async function supplyAssetsToStakers(badger: BadgerSystem, stakers: Signer[]) {
  const stakingAssets = badger.stakingAssets

  const deployerAddress = await badger.deployer.getAddress()
  const numStakers = stakers.length + 1

  for (const key of Object.keys(badger.stakingAssets)) {
    console.log(key)
    // Can't distribute Badger / Digg or associated LP tokens before they exist!
    if (key === PoolAssets.LP_UNI_BADGER || key === PoolAssets.LP_BAL_BADGER || key === PoolAssets.LP_UNI_DIGG || key === PoolAssets.BADGER) continue;
    const asset = badger.stakingAssets[key]
    const assetBalance = await asset.balanceOf(deployerAddress)
    console.log(`--- Asset ${badger.stakingAssets[key].address} ---`)

    for (const staker of stakers) {
      const stakerAddress = await staker.getAddress()

      console.log(
        'balance per staker',
        assetBalance
          .div(numStakers)
          .sub(utils.parseEther('1000000'))
          .toString()
      )
      console.log('remaining balance', (await asset.balanceOf(deployerAddress)).toString())

      await (await asset.transfer(stakerAddress, assetBalance.div(numStakers).sub(utils.parseEther('10000000')))).wait()
    }
  }
}

export async function getStakingAssetBalances(badger: BadgerSystem, address: string) {
  const stakingAssets = badger.stakingAssets
  const deployerAddress = await badger.deployer.getAddress()

  const balances = {}

  for (const key of Object.keys(badger.stakingAssets)) {
    const asset = badger.stakingAssets[key]
    const assetBalance = await asset.balanceOf(deployerAddress)
    const balance = await asset.balanceOf(address)
    balances[key] = balance
  }

  return balances
}

export async function approveAndStake(badger: BadgerSystem, staker: Signer, pool: Contract, amount: BigNumber) {
  const stakingToken = await pool.getStakingToken()
  const stakingContract = badger.getStakingContractByAddress(stakingToken)

  if (!stakingContract) {
    throw new Error(`Staking asset not found in Badger system ${stakingToken}`)
  }

  await (await stakingContract.connect(staker).approve(pool.address, ethers.constants.MaxUint256)).wait()
  await (await pool.connect(staker).stake(amount, '0x')).wait()
}

export async function unstake(badger: BadgerSystem, staker: Signer, pool: Contract, amount: BigNumber) {
  const stakingToken = await pool.getStakingToken()
  const stakingContract = badger.getStakingContractByAddress(stakingToken)

  if (!stakingContract) {
    throw new Error(`Staking asset not found in Badger system ${stakingToken}`)
  }
  await (await pool.connect(staker).unstake(amount, '0x')).wait()
}

export enum StakingActions {
  UNSTAKE,
  STAKE
}

export interface StakingAction {
  actor: Signer
  type: StakingActions
  amount: BigNumber
  pool: Pool
}

export async function simulateStakingStart() {
  // Deposit stakes from various parties
  // Only one user staking
  // Multiple users staking
  // Advance 1 Day
  // Ensure proper total amount distributed
}

export async function simulateStakingDay(badger: BadgerSystem, actions: StakingAction[], startTime: number) {
  // const activePools = await getActivePools(badger, startTime)
  // const completePools = await getCompletedPools(badger, startTime)
  // const futurePools = await getFuturePools(badger, startTime)

  for (const action of actions) {
    const pool = badger.getPoolContractByAddress(action.pool.contract.address)
    if (pool) {
      switch (action.type) {
        case StakingActions.STAKE:
          await approveAndStake(badger, action.actor, pool, action.amount)
          break
        case StakingActions.UNSTAKE:
          await unstake(badger, action.actor, pool, action.amount)
          break
        default:
          throw new Error(`Invalid staking action specified ${action.type}`)
      }
    } else {
      throw new Error(`Pool not found in Badger system ${action.pool.contract.address}`)
    }
    // Expect stake attempts in pools that haven't started to fail
    // Allow unstakes from finished pools
    // Expect stake attempts in pools that have finished to fail
  }

  // Verify user amounts
  // Expect value: Daily rewards. User reward = sum(poolStakingShares*poolMultiplier/totalStakingShares)
}

export async function verifyAllStakingFailsBeforeStartTime(badger: BadgerSystem, stakers: Signer[]) {
  const allPools = await getAllPools(badger)

  for (const pool of allPools) {
    pool.contract.connect(stakers[0]).stake()
    pool.contract.connect(stakers[1]).stake()
  }
  // Try to stake in all future pools
}

export async function verifyAllStakingFailsAfterEndTime(badger: BadgerSystem) {
  // Try to stake in all complete pools
}

export async function verifyCanUnstakeAfterEndTime(badger: BadgerSystem) {
  // Try to unstake in all complete pools, should work
}
