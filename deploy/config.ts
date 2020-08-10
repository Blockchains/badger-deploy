import { BigNumber } from 'ethers'

export interface RebaseConfig {
  network: string
  externalContracts: {
    uniswapV2Factory: string
    uniswapV2Router: string
    systemOwner: string
    uniswapEthDaiPair: string
    dai: string
    weth: string
    chainlinkBtcEth: string
  }
  rebaseParams: {
    initialSupply: BigNumber
    deviationThreshold: BigNumber
    rebaseLag: BigNumber
    minRebaseTimeIntervalSec: BigNumber
    rebaseWindowOffsetSec: BigNumber
    rebaseWindowLengthSec: BigNumber
    baseCpi: BigNumber
  }
  marketOracleParams: {
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  cpiOracleParams: {
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  tokenGeyser: {
    distributionTokenAddress: string
    maxUnlockSchedules: BigNumber
    startBonus: BigNumber
    bonusPeriodSec: BigNumber
    initialSharesPerToken: BigNumber,
    unlockSchedules: {amount: BigNumber, durationSec: BigNumber}[]
  }
}

const ROPSTEN: RebaseConfig = {
  network: 'ropsten',
  externalContracts: {
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    systemOwner: '0x5b294EfFE6Eb9D36A476A24155E8949968A6b360',
    uniswapEthDaiPair: '0x1c5DEe94a34D795f9EEeF830B68B80e44868d316',
    dai: '0xad6d458402f60fd3bd25163575031acdce07538d',
    weth: '0xc778417e063141139fce010982780140aa0cd5ab',
    chainlinkBtcEth: '0x5b8B87A0abA4be247e660B0e0143bB30Cdf566AF'
  },
  rebaseParams: {
    initialSupply: BigNumber.from(50)
      .mul(10 ** 6)
      .mul(10 ** 9),
    deviationThreshold: BigNumber.from('50000000000000000'),
    rebaseLag: BigNumber.from(10),
    minRebaseTimeIntervalSec: BigNumber.from(86400),
    rebaseWindowOffsetSec: BigNumber.from(7200),
    rebaseWindowLengthSec: BigNumber.from(1200),
    baseCpi: BigNumber.from(10).pow(18)
  },
  marketOracleParams: {
    reportExpirationTimeSec: BigNumber.from(88200),
    reportDelaySec: BigNumber.from(3600),
    minimumProviders: BigNumber.from(1)
  },
  cpiOracleParams: {
    reportExpirationTimeSec: BigNumber.from('5356800'),
    reportDelaySec: BigNumber.from(86400),
    minimumProviders: BigNumber.from(1)
  },
  tokenGeyser: {
    distributionTokenAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
    maxUnlockSchedules: BigNumber.from(10000),
    startBonus: BigNumber.from(33),
    bonusPeriodSec: BigNumber.from('5184000'),
    initialSharesPerToken: BigNumber.from('1000000'),
    unlockSchedules: [{
      amount:  BigNumber.from('75000000000000000000'),
      durationSec:  BigNumber.from('7776000')
    }]
  }
}

const LOCAL: RebaseConfig = { ...ROPSTEN }
LOCAL.network = 'local'

export default {
  ROPSTEN,
  LOCAL
}
