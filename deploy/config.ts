import { BigNumber, utils } from 'ethers'
import _ from 'lodash'

export interface RebaseConfig {
  network: string
  externalContracts: {
    uniswapV2Factory: string
    uniswapV2Router: string
    daoAgent: string
    daoFinance: string
    daoGovernanceToken: string
    weth: string
  }
  rebaseSystem: {
    baseToken: string
    baseTokenLogic: string
    supplyPolicy: string
    supplyPolicyLogic: string
    proxyAdmin: string,
    rebaseBtcBaseOracle: string
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
    maxUnlockSchedules: BigNumber
    startBonus: BigNumber
    bonusPeriodSec: BigNumber
    initialSharesPerToken: BigNumber
    unlockSchedules: { amount: BigNumber; durationSec: BigNumber }[]
  }
}

const RINKEBY: RebaseConfig = {
  network: 'rinekby',
  rebaseSystem: {
    baseToken: utils.getAddress('0xBBF9d257bE3447A761E60150DC9AE001Ad971F64'),
    baseTokenLogic: utils.getAddress('0x9101A3bbD51B9B99a5BCB0A74aEDD202e38c7D97'),
    supplyPolicy: utils.getAddress('0x7579E0Fbc53A975a170CA7aC67e9120b02acfd20'),
    supplyPolicyLogic: utils.getAddress('0x754B0E520c4c7000A5e7D000F913C6BC55AdC869'),
    proxyAdmin: utils.getAddress('0x5860db8e032979218fEDE53e20198e97F53c3C31'),
    rebaseBtcBaseOracle: utils.getAddress('0xfBb513Bb9F14dC02171645003D4F45596A4866e4')
  },
  externalContracts: {
    uniswapV2Factory: utils.getAddress('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'),
    uniswapV2Router: utils.getAddress('0x7a250d5630b4cf539739df2c5dacb4c659f2488d'),
    daoAgent: utils.getAddress('0x2eb42841e68a59500159ae543fa6866c4067eb88'), // Aragon DAO Agent
    daoFinance: utils.getAddress('0xdd5780678a675b9d1aa784b0c334c525e3ccaf62'), // Aragon DAO Finance
    daoGovernanceToken: utils.getAddress('0xb132b08112f627cff1a3be863586cd51dcd42b4c'), // Aragon DAO Governance Token
    weth: utils.getAddress('0xc778417e063141139fce010982780140aa0cd5ab')
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
    maxUnlockSchedules: BigNumber.from(10000),
    startBonus: BigNumber.from(33),
    bonusPeriodSec: BigNumber.from('5184000'),
    initialSharesPerToken: BigNumber.from('1000000'),
    unlockSchedules: [
      {
        amount: BigNumber.from('75000000000000000000'),
        durationSec: BigNumber.from('7776000')
      }
    ]
  }
}

const LOCAL: RebaseConfig = _.cloneDeep(RINKEBY)
LOCAL.network = 'local'

export default {
  RINKEBY,
  LOCAL
}
