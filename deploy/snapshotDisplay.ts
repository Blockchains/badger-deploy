import { utils, ethers } from 'ethers'
import { BadgerSnapshot, TrancheSnapshot } from './snapshot'
import _ from 'lodash'

const { formatEther, formatUnits } = utils

interface fUnlockScheduleSnapshot {
  initialLockedShares: string
  unlockedShares: string
  lastUnlockTimestampSec: string
  startTime: string
  endAtSec: string
  durationSec: string
}

interface fPoolSnapshot {
  asset: string
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

interface fTrancheSnapshot {
  id: string
  startTimeOffset: string
  totalAmount: string
  duration: string
  pools: fPoolSnapshot[]
}

interface fDiggCoreSnapshot {
  diggToken: {
    totalSupply: string
    owner: string
    monetaryPolicy: string
  }
  supplyPolicy: {
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
    owner: string
    policy: string
    transactions: string[]
  }
}

interface fDiggOraclesSnapshot {
  marketMedianOracle: {
    owner: string
    providers: string[]
    reportExpirationTimeSec: string
    reportDelaySec: string
    minimumProviders: string
  }
  cpiMedianOracle: {
    owner: string
    providers: string[]
    reportExpirationTimeSec: string
    reportDelaySec: string
    minimumProviders: string
  }
  constantOracle: {
    value: string
    medianOracle: string
  }
  centralizedMarketOracle: {
    owners: any
    threshold: string
  }
}

interface fBadgerDAOSnapshot {
  daoAgent: string
  daoFinance: string
  proxyAdmin: string
  badgerToken: {
    totalSupply: string
  }
  badgerInTimelock: string
  badgerInAgent: string
  diggInTimelock: string
  diggInAgent: string
}

interface fUniswapPoolsSnapshot {
  badgerEthPool: {
    badger: string
    weth: string
    totalSupply: string
  }
  diggEthPool: {
    digg: string
    weth: string
    totalSupply: string
  }
}

export interface fBalancerPoolsSnapshot {
  badgerEthPool: {
    badger?: string
    weth?: string
    totalSupply: string
  }
  diggEthPool: {
    digg?: string
    weth?: string
    totalSupply: string
  }
}

interface fBadgerDistributionPoolsSnapshot {
  tranches: fTrancheSnapshot[]
}

interface fDiggDistributionPoolsSnapshot {
  tranches: fTrancheSnapshot[]
}

interface fStakingAssetsSnapshot {
  [index: string]: {
    asset: string
    totalSupply: string
  }
}

interface fDaoTimelocksSnapshot {
  badgerTimelock: {
    locked: string
    releaseTime: string
    token: string
    beneficiary: string
  }
  diggTimeLock: {
    locked: string
    releaseTime: string
    token: string
    beneficiary: string
  }
}

interface FormattedSnapshot {
  diggCore: fDiggCoreSnapshot
  diggOracles: fDiggOraclesSnapshot
  badgerDAO: fBadgerDAOSnapshot
  uniswapPools: fUniswapPoolsSnapshot
  balancerPools: fBalancerPoolsSnapshot
  badgerDistributionPools: fBadgerDistributionPoolsSnapshot
  diggDistributionPools: fDiggDistributionPoolsSnapshot
  stakingAssets: fStakingAssetsSnapshot
  daoTimelocks: fDaoTimelocksSnapshot
}

export const formatSnapshot = (snapshot: BadgerSnapshot): FormattedSnapshot => {
  const formatted = {} as FormattedSnapshot

  const { diggToken, supplyPolicy, orchestrator } = snapshot.diggCore

  formatted.diggCore = {
    diggToken: {
      totalSupply: formatUnits(diggToken.totalSupply, 'gwei'),
      owner: diggToken.owner,
      monetaryPolicy: diggToken.monetaryPolicy
    },
    supplyPolicy: {
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
      owner: orchestrator.owner,
      policy: orchestrator.policy,
      transactions: orchestrator.transactions
    }
  }

  const { marketMedianOracle, cpiMedianOracle, constantOracle, centralizedMarketOracle } = snapshot.diggOracles

  formatted.diggOracles = {
    marketMedianOracle: {
      owner: marketMedianOracle.owner,
      providers: marketMedianOracle.providers,
      reportExpirationTimeSec: marketMedianOracle.reportExpirationTimeSec.toString(),
      reportDelaySec: marketMedianOracle.reportDelaySec.toString(),
      minimumProviders: marketMedianOracle.minimumProviders.toString()
    },
    cpiMedianOracle: {
      owner: cpiMedianOracle.owner,
      providers: cpiMedianOracle.providers,
      reportExpirationTimeSec: cpiMedianOracle.reportExpirationTimeSec.toString(),
      reportDelaySec: cpiMedianOracle.reportDelaySec.toString(),
      minimumProviders: cpiMedianOracle.minimumProviders.toString()
    },
    constantOracle: {
      value: constantOracle.value.toString(),
      medianOracle: constantOracle.medianOracle
    },
    centralizedMarketOracle: {
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
    daoTimelocks
  } = snapshot

  formatted.badgerDAO= {
    daoAgent: badgerDAO.daoAgent,
    daoFinance: badgerDAO.daoFinance,
    proxyAdmin: badgerDAO.proxyAdmin,
    badgerToken: {
      totalSupply: formatEther(badgerDAO.badgerToken.totalSupply)
    },
    badgerInTimelock: formatEther(badgerDAO.badgerInTimelock),
    badgerInAgent: formatEther(badgerDAO.badgerInAgent),
    diggInTimelock: formatUnits(badgerDAO.diggInTimelock, 'gwei'),
    diggInAgent: formatUnits(badgerDAO.diggInAgent, 'gwei')
  }

  formatted.uniswapPools = {
    badgerEthPool: {
      badger: formatEther(uniswapPools.badgerEthPool.badger),
      weth: formatEther(uniswapPools.badgerEthPool.weth),
      totalSupply: formatEther(uniswapPools.badgerEthPool.totalSupply)
    },
    diggEthPool: {
      digg: formatUnits(uniswapPools.diggEthPool.digg, 'gwei'),
      weth: formatEther(uniswapPools.diggEthPool.weth),
      totalSupply: formatEther(uniswapPools.diggEthPool.totalSupply)
    }
  }

  formatted.balancerPools = {
    badgerEthPool: {
      totalSupply: formatEther(balancerPools.badgerEthPool.totalSupply)
    },
    diggEthPool: {
      totalSupply: formatEther(balancerPools.diggEthPool.totalSupply)
    }
  }

  const fBadgerDistributionPools = {
    tranches: [] as fTrancheSnapshot[]
  } as fBadgerDistributionPoolsSnapshot

  for (const tranche of snapshot.badgerDistributionPools.tranches) {
    const trancheSnapshot = formatTrancheSnapshot(snapshot, tranche)
    fBadgerDistributionPools.tranches.push(trancheSnapshot)
  }

  const fDiggDistributionPools = {
    tranches: [] as fTrancheSnapshot[]
  } as fDiggDistributionPoolsSnapshot

  for (const tranche of snapshot.diggDistributionPools.tranches) {
    const trancheSnapshot = formatTrancheSnapshot(snapshot, tranche)
    fDiggDistributionPools.tranches.push(trancheSnapshot)
  }

  formatted.badgerDistributionPools = fBadgerDistributionPools
  formatted.diggDistributionPools = fDiggDistributionPools
  formatted.stakingAssets = formatStakingAssetsSnapshot(snapshot)

  return formatted;
}

export const formatStakingAssetsSnapshot = (snapshot: BadgerSnapshot): fStakingAssetsSnapshot => {
  const formatted = {} as fStakingAssetsSnapshot

  for (const key of Object.keys(snapshot.stakingAssets)) {
    const asset = snapshot.stakingAssets[key]
    const assetFormatted = {
      asset: asset.asset.toString(),
      totalSupply: formatEther(asset.totalSupply)
    }
    formatted[key] = assetFormatted
  }
  return formatted;
}

export const formatTrancheSnapshot = (snapshot: BadgerSnapshot, tranche: TrancheSnapshot): fTrancheSnapshot => {
  const formatted = {} as fTrancheSnapshot

  formatted.id = tranche.id
  formatted.duration = tranche.duration.toString()
  formatted.startTimeOffset = tranche.startTimeOffset.toString()
  formatted.totalAmount = tranche.totalAmount.toString()

  const pools = [] as fPoolSnapshot[]

  for (const pool of tranche.pools) {
    const poolSnapshot = {} as fPoolSnapshot

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
    pools.push(poolSnapshot)
  }

  return formatted
}
