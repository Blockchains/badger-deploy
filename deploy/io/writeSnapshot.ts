import { utils, ethers } from 'ethers'
import { BadgerSnapshot, TrancheSnapshot } from '../snapshot'
import _ from 'lodash'
const fs = require('fs')

const { formatEther, formatUnits } = utils

export interface fWethSnapshot {
  address: string
  totalSupply: string
}

export interface fUnlockScheduleSnapshot {
  initialLockedShares: string
  unlockedShares: string
  lastUnlockTimestampSec: string
  startTime: string
  endAtSec: string
  durationSec: string
}

export interface fPoolSnapshot {
  asset: string
  address: string
  stakingToken: string
  distributionToken: string
  startBonus: string
  BONUS_DECIMALS: string
  bonusPeriodSec: string
  globalStartTime: string
  totalLocked: string
  totalUnlocked: string
  unlockScheduleCount: string
  unlockSchedules: fUnlockScheduleSnapshot[]
  rewardMultiplier?: string
  totalStaked: string
  special?: string
}

export interface fTrancheSnapshot {
  id: string
  startTimeOffset: string
  totalAmount: string
  duration: string
  pools: fPoolSnapshot[]
}

export interface fDiggCoreSnapshot {
  diggToken: {
    address: string
    totalSupply: string
    owner: string
    monetaryPolicy: string
    rebaseStartTime: string
  }
  supplyPolicy: {
    address: string
    owner: string
    uFrags: string
    deviationThreshold: string
    rebaseLag: string
    minRebaseTimeIntervalSec: string
    rebaseWindowOffsetSec: string
    rebaseWindowLengthSec: string
    epoch: string
    orchestrator: string
  }
  orchestrator: {
    address: string
    owner: string
    policy: string
    transactions: string[]
  }
}

export interface fDiggOraclesSnapshot {
  marketMedianOracle: {
    address: string
    owner: string
    providers: string[]
    providersSize: string
    reportExpirationTimeSec: string
    reportDelaySec: string
    minimumProviders: string
  }
  cpiMedianOracle: {
    address: string
    owner: string
    providers: string[]
    providersSize: string
    reportExpirationTimeSec: string
    reportDelaySec: string
    minimumProviders: string
  }
  constantOracle: {
    address: string
    value: string
    medianOracle: string
  }
  centralizedMarketOracle: {
    address: string
    owners: any
    threshold: string
  }
}

export interface fBadgerDAOSnapshot {
  agent: {
    address: string
    diggAmount: string
    badgerAmount: string
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
  proxyAdmin: string
  badgerToken: {
    address: string
    totalSupply: string
  }
  badgerTimelock: {
    address: string
    amount: string
  }
  diggTimelock: {
    address: string
    amount: string
  }
}

export interface fUniswapCoreSnapshot {
  uniswapV2Router: {
    address: string
  }
  uniswapV2Factory: {
    address: string
  }
}

export interface fUniswapPoolsSnapshot {
  badgerEthPool: {
    address: string
    badger: string
    weth: string
    totalSupply: string
  }
  diggEthPool: {
    address: string
    digg: string
    weth: string
    totalSupply: string
  }
}

export interface fBalancerPoolsSnapshot {
  badgerEthPool: {
    address: string
    badger?: string
    weth?: string
    totalSupply: string
  }
  diggEthPool: {
    address: string
    digg?: string
    weth?: string
    totalSupply: string
  }
}

export interface fDistributionPoolsSnapshot {
  tranches: fTrancheSnapshot[]
}

export interface fStakingAssetsSnapshot {
  [index: string]: {
    address: string
    asset: string
    totalSupply: string
  }
}

export interface fDaoTimelocksSnapshot {
  badgerTimelock: {
    address: string
    locked: string
    releaseTime: string
    token: string
    beneficiary: string
  }
  diggTimelock: {
    address: string
    locked: string
    releaseTime: string
    token: string
    beneficiary: string
  }
}

export interface FormattedSnapshot {
  diggCore: fDiggCoreSnapshot
  diggOracles: fDiggOraclesSnapshot
  badgerDAO: fBadgerDAOSnapshot
  uniswapPools: fUniswapPoolsSnapshot
  balancerPools: fBalancerPoolsSnapshot
  badgerDistributionPools: fDistributionPoolsSnapshot
  diggDistributionPools: fDistributionPoolsSnapshot
  stakingAssets: fStakingAssetsSnapshot
  daoTimelocks: fDaoTimelocksSnapshot
  uniswapCore: fUniswapCoreSnapshot
  weth: fWethSnapshot
}

export const exportSnapshot = (snapshot: BadgerSnapshot): boolean => {
  fs.writeFileSync('local.json', JSON.stringify(formatSnapshot(snapshot)))
  console.log(`Wrote deploy file to local.json`)
  return true
}

export const formatSnapshot = (snapshot: BadgerSnapshot): FormattedSnapshot => {
  const formatted = {} as FormattedSnapshot

  const { diggToken, supplyPolicy, orchestrator } = snapshot.diggCore
  formatted.diggCore = {
    diggToken: {
      address: diggToken.address,
      totalSupply: formatUnits(diggToken.totalSupply, 'gwei'),
      owner: diggToken.owner,
      monetaryPolicy: diggToken.monetaryPolicy,
      rebaseStartTime: diggToken.rebaseStartTime.toString()
    },
    supplyPolicy: {
      address: supplyPolicy.address,
      owner: supplyPolicy.owner,
      uFrags: supplyPolicy.uFrags,
      deviationThreshold: supplyPolicy.deviationThreshold.toString(),
      rebaseLag: supplyPolicy.rebaseLag.toString(),
      minRebaseTimeIntervalSec: supplyPolicy.minRebaseTimeIntervalSec.toString(),
      rebaseWindowOffsetSec: supplyPolicy.rebaseWindowOffsetSec.toString(),
      rebaseWindowLengthSec: supplyPolicy.rebaseWindowLengthSec.toString(),
      epoch: supplyPolicy.epoch.toString(),
      orchestrator: supplyPolicy.orchestrator
    },
    orchestrator: {
      address: orchestrator.address,
      owner: orchestrator.owner,
      policy: orchestrator.policy,
      transactions: orchestrator.transactions
    }
  }

  const { marketMedianOracle, cpiMedianOracle, constantOracle, centralizedMarketOracle } = snapshot.diggOracles

  formatted.diggOracles = {
    marketMedianOracle: {
      address: marketMedianOracle.address,
      owner: marketMedianOracle.owner,
      providers: marketMedianOracle.providers,
      reportExpirationTimeSec: marketMedianOracle.reportExpirationTimeSec.toString(),
      reportDelaySec: marketMedianOracle.reportDelaySec.toString(),
      minimumProviders: marketMedianOracle.minimumProviders.toString(),
      providersSize: marketMedianOracle.providersSize.toString()
    },
    cpiMedianOracle: {
      address: cpiMedianOracle.address,
      owner: cpiMedianOracle.owner,
      providers: cpiMedianOracle.providers,
      reportExpirationTimeSec: cpiMedianOracle.reportExpirationTimeSec.toString(),
      reportDelaySec: cpiMedianOracle.reportDelaySec.toString(),
      minimumProviders: cpiMedianOracle.minimumProviders.toString(),
      providersSize: marketMedianOracle.providersSize.toString()
    },
    constantOracle: {
      address: constantOracle.address,
      value: constantOracle.value.toString(),
      medianOracle: constantOracle.medianOracle
    },
    centralizedMarketOracle: {
      address: centralizedMarketOracle.address,
      owners: centralizedMarketOracle.owners,
      threshold: centralizedMarketOracle.threshold.toString()
    }
  }

  const {
    badgerDAO,
    uniswapPools,
    balancerPools,
    badgerDistributionPools,
    diggDistributionPools,
    stakingAssets,
    daoTimelocks,
    uniswapCore,
    weth
  } = snapshot

  formatted.badgerDAO = {
    agent: {
      address: badgerDAO.agent.address,
      badgerAmount: formatEther(badgerDAO.agent.badgerAmount),
      diggAmount: formatUnits(badgerDAO.agent.diggAmount, 'gwei')
    },
    voting: {
      address: badgerDAO.voting.address
    },
    finance: {
      address: badgerDAO.finance.address
    },
    kernel: {
      address: badgerDAO.kernel.address
    },
    tokenManager: {
      address: badgerDAO.tokenManager.address
    },
    proxyAdmin: badgerDAO.proxyAdmin,
    badgerToken: {
      address: badgerDAO.badgerToken.address,
      totalSupply: formatEther(badgerDAO.badgerToken.totalSupply)
    },
    badgerTimelock: {
      address: badgerDAO.badgerTimelock.address,
      amount: formatEther(badgerDAO.badgerTimelock.amount)
    },
    diggTimelock: {
      address: badgerDAO.diggTimelock.address,
      amount: formatUnits(badgerDAO.diggTimelock.amount, 'gwei')
    }
  }

  formatted.uniswapPools = {
    badgerEthPool: {
      address: uniswapPools.badgerEthPool.address,
      badger: formatEther(uniswapPools.badgerEthPool.badger),
      weth: formatEther(uniswapPools.badgerEthPool.weth),
      totalSupply: formatEther(uniswapPools.badgerEthPool.totalSupply)
    },
    diggEthPool: {
      address: uniswapPools.diggEthPool.address,
      digg: formatUnits(uniswapPools.diggEthPool.digg, 'gwei'),
      weth: formatEther(uniswapPools.diggEthPool.weth),
      totalSupply: formatEther(uniswapPools.diggEthPool.totalSupply)
    }
  }

  formatted.uniswapCore = {
    uniswapV2Factory: {
      address: uniswapCore.uniswapV2Factory.address
    },
    uniswapV2Router: {
      address: uniswapCore.uniswapV2Router.address
    }
  }

  formatted.balancerPools = {
    badgerEthPool: {
      address: balancerPools.badgerEthPool.address,
      totalSupply: formatEther(balancerPools.badgerEthPool.totalSupply)
    },
    diggEthPool: {
      address: balancerPools.diggEthPool.address,
      totalSupply: formatEther(balancerPools.diggEthPool.totalSupply)
    }
  }

  formatted.weth = {
    address: weth.address,
    totalSupply: weth.totalSupply.toString()
  }

  const fBadgerDistributionPools = {
    tranches: [] as fTrancheSnapshot[]
  } as fDistributionPoolsSnapshot

  for (const tranche of snapshot.badgerDistributionPools.tranches) {
    const trancheSnapshot = formatTrancheSnapshot(snapshot, tranche)
    fBadgerDistributionPools.tranches.push(trancheSnapshot)
  }

  const fDiggDistributionPools = {
    tranches: [] as fTrancheSnapshot[]
  } as fDistributionPoolsSnapshot

  for (const tranche of snapshot.diggDistributionPools.tranches) {
    const trancheSnapshot = formatTrancheSnapshot(snapshot, tranche)
    fDiggDistributionPools.tranches.push(trancheSnapshot)
  }

  formatted.badgerDistributionPools = fBadgerDistributionPools
  formatted.diggDistributionPools = fDiggDistributionPools
  formatted.stakingAssets = formatStakingAssetsSnapshot(snapshot)

  return formatted
}

export const formatStakingAssetsSnapshot = (snapshot: BadgerSnapshot): fStakingAssetsSnapshot => {
  const formatted = {} as fStakingAssetsSnapshot

  for (const key of Object.keys(snapshot.stakingAssets)) {
    const asset = snapshot.stakingAssets[key]
    const assetFormatted = {
      address: asset.address,
      asset: asset.asset.toString(),
      totalSupply: formatEther(asset.totalSupply)
    }
    formatted[key] = assetFormatted
  }
  return formatted
}

export const formatTrancheSnapshot = (snapshot: BadgerSnapshot, tranche: TrancheSnapshot): fTrancheSnapshot => {
  const formatted = {} as fTrancheSnapshot

  formatted.id = tranche.id
  formatted.duration = tranche.duration.toString()
  formatted.startTimeOffset = tranche.startTimeOffset.toString()
  formatted.totalAmount = tranche.totalAmount.toString()

  const pools = [] as fPoolSnapshot[]
  console.log(`Tranche: ${tranche.id}`)

  for (const pool of tranche.pools) {
    const poolSnapshot = {} as fPoolSnapshot

    poolSnapshot.address = pool.address
    poolSnapshot.asset = pool.asset
    poolSnapshot.stakingToken = pool.stakingToken
    poolSnapshot.distributionToken = pool.distributionToken
    poolSnapshot.startBonus = pool.startBonus.toString()
    poolSnapshot.BONUS_DECIMALS = pool.BONUS_DECIMALS.toString()
    poolSnapshot.bonusPeriodSec = pool.bonusPeriodSec.toString()
    poolSnapshot.totalLocked = pool.totalLocked.toString()
    poolSnapshot.totalUnlocked = pool.totalUnlocked.toString()
    poolSnapshot.unlockScheduleCount = pool.unlockScheduleCount.toString()
    poolSnapshot.globalStartTime = pool.globalStartTime.toString()
    poolSnapshot.totalStaked = pool.totalStaked.toString()
    poolSnapshot.rewardMultiplier = poolSnapshot.rewardMultiplier?.toString()
    poolSnapshot.special = poolSnapshot.special?.toString()

    const formattedSchedules = [] as fUnlockScheduleSnapshot[]

    console.log('number of unlock schedules', pool.unlockSchedules.length)

    for (const schedule of pool.unlockSchedules) {
      formattedSchedules.push({
        initialLockedShares: schedule.initialLockedShares.toString(),
        unlockedShares: schedule.unlockedShares.toString(),
        lastUnlockTimestampSec: schedule.lastUnlockTimestampSec.toString(),
        startTime: schedule.startTime.toString(),
        endAtSec: schedule.endAtSec.toString(),
        durationSec: schedule.durationSec.toString()
      })
    }

    poolSnapshot.unlockSchedules = formattedSchedules
    console.log(`Push Pool ${poolSnapshot.address} for tranche ${tranche.id}`)

    pools.push(poolSnapshot)
  }

  formatted.pools = pools
  return formatted
}
