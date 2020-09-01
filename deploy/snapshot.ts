import { run, ethers } from '@nomiclabs/buidler'
import { deployContract } from 'ethereum-waffle'
import { Contract, Signer, BigNumber, utils } from 'ethers'
import {
  SystemConfig,
  PoolAssets,
  Special,
  poolAssetMetadata,
  externalPoolAddresses,
  daysToSeconds,
  TrancheConfig
} from './badgerConfig'
import * as _ from 'lodash'
import { BadgerSystem, Tranche } from './BadgerSystem'

export interface UnlockScheduleSnapshot {
  initialLockedShares: BigNumber
  unlockedShares: BigNumber
  lastUnlockTimestampSec: BigNumber
  startTime: BigNumber
  endAtSec: BigNumber
  durationSec: BigNumber
}

export interface PoolSnapshot {
  asset: PoolAssets
  stakingToken: string
  distributionToken: string
  startBonus: BigNumber
  BONUS_DECIMALS: BigNumber
  bonusPeriodSec: BigNumber
  globalStartTime: BigNumber
  totalLocked: BigNumber
  totalUnlocked: BigNumber
  unlockScheduleCount: BigNumber
  unlockSchedules: UnlockScheduleSnapshot[]
  rewardMultiplier?: BigNumber
  totalStaked: BigNumber
  special?: Special
}

export interface TrancheSnapshot {
  id: string
  startTimeOffset: BigNumber
  totalAmount: BigNumber
  duration: BigNumber
  pools: PoolSnapshot[]
}

export interface DiggCoreSnapshot {
  diggToken: {
    totalSupply: BigNumber
    owner: string
    monetaryPolicy: string
    rebaseStartTime: BigNumber
  }
  supplyPolicy: {
    owner: string
    uFrags: string
    deviationThreshold: BigNumber
    rebaseLag: BigNumber
    minRebaseTimeIntervalSec: BigNumber
    rebaseWindowOffsetSec: BigNumber
    rebaseWindowLengthSec: BigNumber
    epoch: BigNumber
    orchestrator: string
  }
  orchestrator: {
    owner: string
    policy: string
    transactions: string[]
  }
}

export interface DiggOraclesSnapshot {
  marketMedianOracle: {
    owner: string
    providers: string[]
    providersSize: BigNumber
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  cpiMedianOracle: {
    owner: string
    providers: string[]
    providersSize: BigNumber
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  constantOracle: {
    value: BigNumber
    medianOracle: string
  }
  centralizedMarketOracle: {
    owners: any
    threshold: BigNumber
  }
}

export interface BadgerDAOSnapshot {
  daoAgent: string
  daoFinance: string
  proxyAdmin: string
  badgerToken: {
    totalSupply: BigNumber
  }
  badgerInTimelock: BigNumber
  badgerInAgent: BigNumber
  diggInTimelock: BigNumber
  diggInAgent: BigNumber
}

export interface UniswapPoolsSnapshot {
  badgerEthPool: {
    badger: BigNumber
    weth: BigNumber
    totalSupply: BigNumber
  }
  diggEthPool: {
    digg: BigNumber
    weth: BigNumber
    totalSupply: BigNumber
  }
}

export interface BalancerPoolsSnapshot {
  badgerEthPool: {
    badger?: BigNumber
    weth?: BigNumber
    totalSupply: BigNumber
  }
  diggEthPool: {
    digg?: BigNumber
    weth?: BigNumber
    totalSupply: BigNumber
  }
}

export interface DistributionPoolsSnapshot {
  tranches: TrancheSnapshot[]
}

export interface StakingAssetsSnapshot {
  [index: string]: {
    asset: string
    totalSupply: BigNumber
  }
}

export interface DaoTimelocksSnapshot {
  badgerTimelock: {
    locked: BigNumber
    releaseTime: BigNumber
    token: string
    beneficiary: string
  }
  diggTimeLock: {
    locked: BigNumber
    releaseTime: BigNumber
    token: string
    beneficiary: string
  }
}

export interface BadgerSnapshot {
  diggCore: DiggCoreSnapshot
  diggOracles: DiggOraclesSnapshot
  badgerDAO: BadgerDAOSnapshot
  uniswapPools: UniswapPoolsSnapshot
  balancerPools: BalancerPoolsSnapshot
  badgerDistributionPools: DistributionPoolsSnapshot
  diggDistributionPools: DistributionPoolsSnapshot
  stakingAssets: StakingAssetsSnapshot
  daoTimelocks: DaoTimelocksSnapshot

  config: SystemConfig
  deployer: Signer
}

export const getSnapshot = async (badger: BadgerSystem): Promise<BadgerSnapshot> => {
  const snapshot = {} as BadgerSnapshot

  const { diggToken, supplyPolicy, orchestrator } = badger.diggCore

  _.set(snapshot, 'diggCore', {
    diggToken: {
      totalSupply: await diggToken.totalSupply(),
      owner: await diggToken.owner(),
      monetaryPolicy: await diggToken.monetaryPolicy(),
      rebaseStartTime: await diggToken.rebaseStartTime()
    },
    supplyPolicy: {
      owner: await supplyPolicy.owner(),
      uFrags: await supplyPolicy.uFrags(),
      deviationThreshold: await supplyPolicy.deviationThreshold(),
      rebaseLag: await supplyPolicy.rebaseLag(),
      minRebaseTimeIntervalSec: await supplyPolicy.minRebaseTimeIntervalSec(),
      rebaseWindowOffsetSec: await supplyPolicy.rebaseWindowOffsetSec(),
      rebaseWindowLengthSec: await supplyPolicy.rebaseWindowLengthSec(),
      epoch: await supplyPolicy.epoch(),
      orchestrator: await supplyPolicy.orchestrator()
    },
    orchestrator: {
      owner: await orchestrator.owner(),
      policy: await orchestrator.policy(),
      transactions: [] // TODO: Track transaction recipients if / when they are used
    }
  })

  const { marketMedianOracle, cpiMedianOracle, constantOracle, centralizedMarketOracle } = badger.diggOracles

  const marketProvider = await marketMedianOracle.providers(0) 
  const cpiProvider = await cpiMedianOracle.providers(0)

  _.set(snapshot, 'diggOracles', {
    marketMedianOracle: {
      owner: await marketMedianOracle.owner(),
      providersSize: await marketMedianOracle.providersSize(),
      providers: [marketProvider],
      reportExpirationTimeSec: await marketMedianOracle.reportExpirationTimeSec(),
      reportDelaySec: await marketMedianOracle.reportDelaySec(),
      minimumProviders: await marketMedianOracle.minimumProviders()
    },
    cpiMedianOracle: {
      owner: await cpiMedianOracle.owner(),
      providersSize: await cpiMedianOracle.providersSize(),
      providers: [cpiProvider],
      reportExpirationTimeSec: await cpiMedianOracle.reportExpirationTimeSec(),
      reportDelaySec: await cpiMedianOracle.reportDelaySec(),
      minimumProviders: await cpiMedianOracle.minimumProviders()
    },
    constantOracle: {
      value: await constantOracle.value(),
      medianOracle: await constantOracle.medianOracle()
    },
    centralizedMarketOracle: {
      owners: await centralizedMarketOracle.getOwners(),
      threshold: await centralizedMarketOracle.getThreshold()
    }
  })

  const {
    badgerDAO: { daoAgent, daoFinance, proxyAdmin, badgerToken },
    daoTimelocks: { badgerTimelock, diggTimeLock }
  } = badger

  _.set(snapshot, 'badgerDAO', {
    daoAgent,
    daoFinance,
    proxyAdmin,
    badgerToken: {
      totalSupply: await badgerToken.totalSupply()
    },
    badgerInTimelock: await badgerToken.balanceOf(badgerTimelock.address),
    badgerInAgent: await badgerToken.balanceOf(daoAgent),
    diggInTimelock: await diggToken.balanceOf(diggTimeLock.address),
    diggInAgent: await diggToken.balanceOf(daoAgent)
  })

  const { uniswapPools, balancerPools, weth } = badger

  const badgerEthReserves = await uniswapPools.badgerEthPool.getReserves()
  const diggEthReserves = await uniswapPools.diggEthPool.getReserves()

  // console.log('badgerEthReserves', badgerEthReserves)
  // console.log('diggEthReserves', diggEthReserves)

  _.set(snapshot, 'uniswapPools', {
    badgerEthPool: {
      badger: badgerEthReserves[0],
      weth: badgerEthReserves[1],
      totalSupply: await uniswapPools.badgerEthPool.totalSupply()
    },
    diggEthPool: {
      digg: diggEthReserves[0],
      weth: diggEthReserves[1],
      totalSupply: await uniswapPools.badgerEthPool.totalSupply()
    }
  })

  _.set(snapshot, 'balancerPools', {
    badgerEthPool: {
    //   badger: await balancerPools.badgerEthPool.getBalance(badgerToken.address),
    //   weth: await balancerPools.badgerEthPool.getBalance(weth.address),
      totalSupply: await balancerPools.badgerEthPool.totalSupply()
    },
    diggEthPool: {
    //   badger: await balancerPools.diggEthPool.getBalance(diggToken.address),
    //   weth: await balancerPools.diggEthPool.getBalance(weth.address),
      totalSupply: await balancerPools.diggEthPool.totalSupply()
    }
  })

  const badgerDistributionPools = {
      tranches: [] as TrancheSnapshot[]
  } as DistributionPoolsSnapshot

  for (const tranche of badger.badgerDistributionPools.tranches) {
    const trancheSnapshot = await getTrancheSnapshot(badger, tranche)
    // console.log(trancheSnapshot)
    badgerDistributionPools.tranches.push(trancheSnapshot)
  }

  const diggDistributionPools = {
    tranches: [] as TrancheSnapshot[]
} as DistributionPoolsSnapshot

  for (const tranche of badger.diggDistributionPools.tranches) {
    const trancheSnapshot = await getTrancheSnapshot(badger, tranche)
    diggDistributionPools.tranches.push(trancheSnapshot)
  }

  _.set(snapshot, 'badgerDistributionPools', badgerDistributionPools)
  _.set(snapshot, 'diggDistributionPools', diggDistributionPools)

  const stakingAssetSnapshot = await getStakingAssetsSnapshot(badger)

  _.set(snapshot, 'stakingAssets', stakingAssetSnapshot)
  _.set(snapshot, 'daoTimelocks', {
    badgerTimelock: {
      locked: await badgerToken.balanceOf(badgerTimelock.address),
      releaseTime: await badgerTimelock.releaseTime(),
      token: await badgerTimelock.token(),
      beneficiary: await badgerTimelock.beneficiary()
    },
    diggTimeLock: {
      locked: await diggToken.balanceOf(diggTimeLock.address),
      releaseTime: await diggTimeLock.releaseTime(),
      token: await diggTimeLock.token(),
      beneficiary: await diggTimeLock.beneficiary()
    }
  })

  snapshot.config = badger.config
  snapshot.deployer = badger.deployer

  return snapshot
}

export const confirmBadgerDeployment = async (badger: BadgerSystem, config: SystemConfig) => {
  const currentsnapshot = await getSnapshot(badger)
  //   const expectedsnapshot = await generateExpectedDeploySnapshot(badger)
}

export const getStakingAssetsSnapshot = async (badger: BadgerSystem): Promise<StakingAssetsSnapshot> => {
  const snapshot = {} as StakingAssetsSnapshot

  for (const key of Object.keys(badger.stakingAssets)) {
    const assetContract = badger.stakingAssets[key]
    const assetSnapshot = {
      asset: key,
      totalSupply: await assetContract.totalSupply()
    }

    snapshot[key] = assetSnapshot
  }

  return snapshot
}

export const getTrancheSnapshot = async (badger: BadgerSystem, tranche: Tranche): Promise<TrancheSnapshot> => {
  const snapshot = {} as TrancheSnapshot

  snapshot.id = tranche.id
  snapshot.duration = tranche.duration
  snapshot.startTimeOffset = tranche.startTimeOffset
  snapshot.totalAmount = tranche.totalAmount
  const pools = [] as PoolSnapshot[]

  for (const pool of tranche.pools) {
    const poolSnapshot = {} as PoolSnapshot
    const contract = pool.contract

    poolSnapshot.asset = pool.asset
    poolSnapshot.stakingToken = await contract.getStakingToken()
    poolSnapshot.distributionToken = await contract.getDistributionToken()
    poolSnapshot.startBonus = await contract.startBonus()
    poolSnapshot.BONUS_DECIMALS = await contract.BONUS_DECIMALS()
    poolSnapshot.bonusPeriodSec = await contract.bonusPeriodSec()
    poolSnapshot.totalLocked = await contract.totalLocked()
    poolSnapshot.totalUnlocked = await contract.totalUnlocked()
    poolSnapshot.unlockScheduleCount = await contract.unlockScheduleCount()
    poolSnapshot.globalStartTime = await contract.globalStartTime()
    poolSnapshot.totalStaked = await contract.totalStaked()
    poolSnapshot.rewardMultiplier = poolSnapshot.rewardMultiplier ? poolSnapshot.rewardMultiplier : BigNumber.from(1)
    poolSnapshot.special = poolSnapshot.special ? poolSnapshot.special : undefined

    const schedules = [] as UnlockScheduleSnapshot[]

    for (let i = 0; i > poolSnapshot.unlockScheduleCount.toNumber(); i++) {
      const schedule = await contract.unlockSchedules(i)
      schedules.push(schedule)
    }

    poolSnapshot.unlockSchedules = schedules
    pools.push(poolSnapshot)
  }
  snapshot.pools = pools

  return snapshot
}
