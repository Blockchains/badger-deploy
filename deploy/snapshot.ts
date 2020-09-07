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

export interface WethSnapshot {
  address: string
  totalSupply: BigNumber
}

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
  address: string
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
    address: string
    totalSupply: BigNumber
    owner: string
    monetaryPolicy: string
    rebaseStartTime: BigNumber
  }
  supplyPolicy: {
    address: string
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
    address: string
    owner: string
    policy: string
    transactions: string[]
  }
}

export interface DiggOraclesSnapshot {
  marketMedianOracle: {
    address: string
    owner: string
    providers: string[]
    providersSize: BigNumber
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  cpiMedianOracle: {
    address: string
    owner: string
    providers: string[]
    providersSize: BigNumber
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  constantOracle: {
    address: string
    value: BigNumber
    medianOracle: string
  }
  centralizedMarketOracle: {
    address: string
    owners: any
    threshold: BigNumber
  }
}

export interface BadgerDAOSnapshot {
  agent: {
    address: string
    diggAmount: BigNumber
    badgerAmount: BigNumber
  }
  finance: {
    address: string
  }
  kernel: {
    address: string
  }
  tokenManager: {
    address: string
  }
  voting: {
    address: string
  }
  proxyAdmin: {
    address: string
  }
  badgerToken: {
    address: string
    totalSupply: BigNumber
  }
  badgerTimelock: {
    address: string
    amount: BigNumber
  }
  diggTimelock: {
    address: string
    amount: BigNumber
  }
}

export interface UniswapPoolsSnapshot {
  badgerEthPool: {
    address: string
    badger: BigNumber
    weth: BigNumber
    totalSupply: BigNumber
  }
  diggEthPool: {
    address: string
    digg: BigNumber
    weth: BigNumber
    totalSupply: BigNumber
  }
}

export interface UniswapCoreSnapshot {
  uniswapV2Router: {
    address: string
  }
  uniswapV2Factory: {
    address: string
  }
}

export interface BalancerPoolsSnapshot {
  badgerEthPool: {
    address: string
    badger?: BigNumber
    weth?: BigNumber
    totalSupply: BigNumber
  }
  diggEthPool: {
    address: string
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
    address: string
    asset: string
    totalSupply: BigNumber
  }
}

export interface DaoTimelocksSnapshot {
  badgerTimelock: {
    address: string
    locked: BigNumber
    releaseTime: BigNumber
    token: string
    beneficiary: string
  }
  diggTimelock: {
    address: string
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
  uniswapCore: UniswapCoreSnapshot
  uniswapPools: UniswapPoolsSnapshot
  balancerPools: BalancerPoolsSnapshot
  badgerDistributionPools: DistributionPoolsSnapshot
  diggDistributionPools: DistributionPoolsSnapshot
  stakingAssets: StakingAssetsSnapshot
  daoTimelocks: DaoTimelocksSnapshot
  weth: WethSnapshot

  config: SystemConfig
  deployer: Signer
}

export const getSnapshot = async (badger: BadgerSystem): Promise<BadgerSnapshot> => {
  const snapshot = {} as BadgerSnapshot

  const { diggToken, supplyPolicy, orchestrator } = badger.diggCore

  _.set(snapshot, 'diggCore', {
    diggToken: {
      address: diggToken.address,
      totalSupply: await diggToken.totalSupply(),
      owner: await diggToken.owner(),
      monetaryPolicy: await diggToken.monetaryPolicy(),
      rebaseStartTime: await diggToken.rebaseStartTime()
    },
    supplyPolicy: {
      address: supplyPolicy.address,
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
      address: orchestrator.address,
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
      address: marketMedianOracle.address,
      owner: await marketMedianOracle.owner(),
      providersSize: await marketMedianOracle.providersSize(),
      providers: [marketProvider],
      reportExpirationTimeSec: await marketMedianOracle.reportExpirationTimeSec(),
      reportDelaySec: await marketMedianOracle.reportDelaySec(),
      minimumProviders: await marketMedianOracle.minimumProviders()
    },
    cpiMedianOracle: {
      address: cpiMedianOracle.address,
      owner: await cpiMedianOracle.owner(),
      providersSize: await cpiMedianOracle.providersSize(),
      providers: [cpiProvider],
      reportExpirationTimeSec: await cpiMedianOracle.reportExpirationTimeSec(),
      reportDelaySec: await cpiMedianOracle.reportDelaySec(),
      minimumProviders: await cpiMedianOracle.minimumProviders()
    },
    constantOracle: {
      address: constantOracle.address,
      value: await constantOracle.value(),
      medianOracle: await constantOracle.medianOracle()
    },
    centralizedMarketOracle: {
      address: centralizedMarketOracle.address,
      owners: await centralizedMarketOracle.getOwners(),
      threshold: await centralizedMarketOracle.getThreshold()
    }
  })

  const {
    badgerDAO: { daoAgent, daoFinance, finance, agent, voting, kernel, tokenManager, proxyAdmin, badgerToken },
    daoTimelocks: { badgerTimelock, diggTimelock }
  } = badger

  _.set(snapshot, 'badgerDAO', {
    agent: {
      address: agent.address,
      badgerAmount: await badgerToken.balanceOf(daoAgent),
      diggAmount: await diggToken.balanceOf(daoAgent)
    },
    finance: {
      address: finance.address
    },
    voting: {
      address: voting.address
    },
    kernel: {
      address: kernel.address
    },
    tokenManager: {
      address: tokenManager.address
    },
    proxyAdmin: {
      address: proxyAdmin.address
    },
    badgerToken: {
      address: badgerToken.address,
      totalSupply: await badgerToken.totalSupply()
    },
    badgerTimelock: {
      address: badgerTimelock.address,
      amount: await badgerToken.balanceOf(badgerTimelock.address)
    },
    diggTimelock: {
      address: diggTimelock.address,
      amount: await diggToken.balanceOf(diggTimelock.address)
    }
  })

  const { uniswapPools, uniswapCore, balancerPools, weth } = badger

  const badgerEthReserves = await uniswapPools.badgerEthPool.getReserves()
  const diggEthReserves = await uniswapPools.diggEthPool.getReserves()

  // console.log('badgerEthReserves', badgerEthReserves)
  // console.log('diggEthReserves', diggEthReserves)

  _.set(snapshot, 'uniswapPools', {
    badgerEthPool: {
      address: uniswapPools.badgerEthPool.address,
      badger: badgerEthReserves[0],
      weth: badgerEthReserves[1],
      totalSupply: await uniswapPools.badgerEthPool.totalSupply()
    },
    diggEthPool: {
      address: uniswapPools.diggEthPool.address,
      digg: diggEthReserves[0],
      weth: diggEthReserves[1],
      totalSupply: await uniswapPools.diggEthPool.totalSupply()
    }
  })

  _.set(snapshot, 'balancerPools', {
    badgerEthPool: {
      address: balancerPools.badgerEthPool.address,
    //   badger: await balancerPools.badgerEthPool.getBalance(badgerToken.address),
    //   weth: await balancerPools.badgerEthPool.getBalance(weth.address),
      totalSupply: await balancerPools.badgerEthPool.totalSupply()
    },
    diggEthPool: {
      address: balancerPools.diggEthPool.address,
    //   badger: await balancerPools.diggEthPool.getBalance(diggToken.address),
    //   weth: await balancerPools.diggEthPool.getBalance(weth.address),
      totalSupply: await balancerPools.diggEthPool.totalSupply()
    }
  })

  _.set(snapshot, 'uniswapCore', {
    uniswapV2Factory: {
      address: uniswapCore.uniswapV2Factory.address
    },
    uniswapV2Router: {
      address: uniswapCore.uniswapV2Router.address
    }
  })


  _.set(snapshot, 'weth', {
    address: badger.weth.address,
    totalSupply: await weth.totalSupply()
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
    diggTimelock: {
      locked: await diggToken.balanceOf(diggTimelock.address),
      releaseTime: await diggTimelock.releaseTime(),
      token: await diggTimelock.token(),
      beneficiary: await diggTimelock.beneficiary()
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
      address: assetContract.address,
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

    poolSnapshot.address = pool.contract.address
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
