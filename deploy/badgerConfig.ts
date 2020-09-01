import { BigNumber, utils } from 'ethers'
import _ from 'lodash'
import { addListener } from 'process'
import { getCurrentTimestamp } from './test/helpers/time'

const ONE = BigNumber.from(1)
const TWO = BigNumber.from(2)

export const daysToSeconds = (days: number): BigNumber => {
  return BigNumber.from(days).mul(86400)
}

export interface TrancheConfig {
  id: string
  startTimeOffset: BigNumber
  totalAmount: BigNumber
  duration: BigNumber
  pools: PoolConfig[]
}

export enum PoolAssets {
  LP_UNI_BADGER = 'LP_UNI_BADGER',
  CRV_LP_sbtc = 'CRV_LP_sbtc',
  LP_BAL_CRV_BAL_RENBTC = 'LP_BAL_CRV_BAL_RENBTC',
  CRV_LP_renbtc = 'CRV_LP_renbtc',
  BAL_LP_wbtc_WETH = 'BAL_LP_wbtc_WETH',
  Wbtc = 'Wbtc',
  RenBTC = 'RenBTC',
  CREAM = 'CREAM',
  Sbtc = 'Sbtc',
  Yycurv = 'Yycurv',
  Yalink = 'Yalink',
  LEND = 'LEND',
  UNI_LP_AMPL_weth = 'UNI_LP_AMPL_weth',
  LP_BAL_BADGER = 'LP_BAL_BADGER',
  BADGER = 'BADGER',
  Ampl = 'Ampl',
  Xampl = 'Xampl',
  Based = 'Based',
  LP_UNI_DIGG = 'LP_UNI_DIGG'
}

export enum AssetTypes {
  CRV_LP,
  UNI_LP,
  BAL_LP,
  WBTC,
  RenBTC,
  ERC20,
  AMPL,
  BASED,
  CREAM
}

export const poolAssetMetadata: {
  [index: string]: {
    type: AssetTypes
    name: string
    symbol: string
    decimals: BigNumber
  }
} = {}

poolAssetMetadata[PoolAssets.CRV_LP_sbtc] = {
  type: AssetTypes.CRV_LP,
  name: 'Curve.fi renBTC/wBTC/sBTC',
  symbol: 'crvRenWSBTC',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.LP_BAL_CRV_BAL_RENBTC] = {
  type: AssetTypes.CRV_LP,
  name: 'Curve.fi renBTC/wBTC/sBTC',
  symbol: 'crvRenWSBTC',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.CRV_LP_renbtc] = {
  type: AssetTypes.BAL_LP,
  name: 'Curve.fi renBTC/wBTC',
  symbol: 'crvRenWBTC',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.BAL_LP_wbtc_WETH] = {
  type: AssetTypes.BAL_LP,
  name: 'Balancer Pool Token',
  symbol: 'BPT',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.Wbtc] = {
  type: AssetTypes.WBTC,
  name: 'Wrapped BTC',
  symbol: 'WBTC',
  decimals: BigNumber.from(8)
}
poolAssetMetadata[PoolAssets.RenBTC] = {
  type: AssetTypes.RenBTC,
  name: 'renBTC',
  symbol: 'renBTC',
  decimals: BigNumber.from(8)
}
poolAssetMetadata[PoolAssets.CREAM] = {
  type: AssetTypes.CREAM,
  name: 'Cream',
  symbol: 'CREAM',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.Sbtc] = {
  type: AssetTypes.ERC20,
  name: 'Synth sBTC',
  symbol: 'sBTC',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.Yycurv] = {
  type: AssetTypes.ERC20,
  name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
  symbol: 'yDAI+yUSDC+yUSDT+yTUSD',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.Yalink] = {
  type: AssetTypes.ERC20,
  name: 'yearn Aave Interest bearing LINK',
  symbol: 'yaLINK',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.UNI_LP_AMPL_weth] = {
  type: AssetTypes.UNI_LP,
  name: 'Uniswap V2',
  symbol: 'UNI-V2',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.LEND] = {
  type: AssetTypes.ERC20,
  name: 'AAVE',
  symbol: 'LEND',
  decimals: BigNumber.from(18)
}
poolAssetMetadata[PoolAssets.Ampl] = {
  type: AssetTypes.AMPL,
  name: 'Ampleforth',
  symbol: 'AMPL',
  decimals: BigNumber.from(9)
}
poolAssetMetadata[PoolAssets.Xampl] = {
  type: AssetTypes.AMPL,
  name: 'Antiample',
  symbol: 'XAMP',
  decimals: BigNumber.from(9)
}
poolAssetMetadata[PoolAssets.Based] = {
  type: AssetTypes.BASED,
  name: '$BASED',
  symbol: '$BASED',
  decimals: BigNumber.from(18)
}

export const externalPoolAddresses = {
  MAINNET: {} as any
}

externalPoolAddresses.MAINNET[PoolAssets.CRV_LP_sbtc] = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3'
externalPoolAddresses.MAINNET[PoolAssets.LP_BAL_CRV_BAL_RENBTC] = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3'
externalPoolAddresses.MAINNET[PoolAssets.CRV_LP_renbtc] = '0x49849C98ae39Fff122806C06791Fa73784FB3675'
externalPoolAddresses.MAINNET[PoolAssets.BAL_LP_wbtc_WETH] = '0xee9a6009b926645d33e10ee5577e9c8d3c95c165'
externalPoolAddresses.MAINNET[PoolAssets.Wbtc] = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
externalPoolAddresses.MAINNET[PoolAssets.RenBTC] = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d'
externalPoolAddresses.MAINNET[PoolAssets.CREAM] = '0x2ba592F78dB6436527729929AAf6c908497cB200'
externalPoolAddresses.MAINNET[PoolAssets.Sbtc] = '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'
externalPoolAddresses.MAINNET[PoolAssets.Yycurv] = '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8'
externalPoolAddresses.MAINNET[PoolAssets.Yalink] = '0x29e240cfd7946ba20895a7a02edb25c210f9f324'
externalPoolAddresses.MAINNET[PoolAssets.UNI_LP_AMPL_weth] = '0xc5be99a02c6857f9eac67bbce58df5572498f40c'
externalPoolAddresses.MAINNET[PoolAssets.Ampl] = '0xd46ba6d942050d489dbd938a2c909a5d5039a161'
externalPoolAddresses.MAINNET[PoolAssets.Xampl] = '0xf911a7ec46a2c6fa49193212fe4a2a9b95851c27'
externalPoolAddresses.MAINNET[PoolAssets.Based] = '0x68A118Ef45063051Eac49c7e647CE5Ace48a68a5'
externalPoolAddresses.MAINNET[PoolAssets.LEND] = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'

export enum Special {
  REN_BADGER
}

export interface PoolConfig {
  asset: PoolAssets
  rewardMultiplier?: BigNumber
  special?: Special
}

export interface SystemConfig {
  network: number
  externalContracts: any
  rebaseSystem: {
    baseToken: string
    baseTokenLogic: string
    supplyPolicy: string
    supplyPolicyLogic: string
    proxyAdmin: string
    rebaseBtcBaseOracle: string
  }
  daoParams: {
    tokenName: string
    tokenSymbol: string
    id: string
    initialSupply: BigNumber
    financePeriod: BigNumber
    useAgentAsVault: boolean
    supportRequired: BigNumber
    minAcceptanceQuorum: BigNumber
    voteDuration: BigNumber
  }
  badgerParams: {
    totalSupply: BigNumber
  }
  tokenLockParams: {
    badgerLockAmount: BigNumber,
    diggLockAmount: BigNumber,
    lockDuration: BigNumber
  }
  diggParams: {
    initialSupply: BigNumber
    deviationThreshold: BigNumber
    rebaseLag: BigNumber
    minRebaseTimeIntervalSec: BigNumber
    rebaseWindowOffsetSec: BigNumber
    rebaseWindowLengthSec: BigNumber
    baseCpi: BigNumber
    rebaseDelayAfterStakingStart: BigNumber
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
  centralizedOracleParams: {
    owners: string[],
    threshold: BigNumber
  }
  tokenGeyser: {
    maxUnlockSchedules: BigNumber
    startBonus: BigNumber
    bonusPeriodSec: BigNumber
    initialSharesPerToken: BigNumber
    unlockSchedules: { amount: BigNumber; durationSec: BigNumber }[]
  }
  badgerTranches: TrancheConfig[]
  trancheStart: BigNumber
  diggTranches: TrancheConfig[]
}

const RINKEBY: SystemConfig = {
  network: 4,
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
  tokenLockParams: {
    badgerLockAmount: utils.parseUnits('10500000', 'ether'),
    diggLockAmount: BigNumber.from(3125)
    .mul(10 ** 9),
    lockDuration: daysToSeconds(30)
  },
  badgerParams: {
    totalSupply: utils.parseUnits('21000000', 'ether')
  },
  daoParams: {
    tokenName: "Badger",
    tokenSymbol: "BADGER",
    id: "badger-finance",
    initialSupply: utils.parseEther("21000000"),
    financePeriod: BigNumber.from(0),
    useAgentAsVault: true,
    supportRequired: utils.parseEther("0.5"),
    minAcceptanceQuorum: utils.parseEther("0.05"),
    voteDuration: daysToSeconds(7)
  },
  diggParams: {
    initialSupply: BigNumber.from(6250)
      .mul(10 ** 9),
    deviationThreshold: BigNumber.from('50000000000000000'),
    rebaseLag: BigNumber.from(10),
    minRebaseTimeIntervalSec: BigNumber.from(86400),
    rebaseWindowOffsetSec: BigNumber.from(7200),
    rebaseWindowLengthSec: BigNumber.from(1200),
    baseCpi: BigNumber.from(10).pow(18),
    rebaseDelayAfterStakingStart: daysToSeconds(30)
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
  centralizedOracleParams: {
    owners: [],
    threshold: BigNumber.from(1)
  },
  tokenGeyser: {
    maxUnlockSchedules: BigNumber.from(10000),
    startBonus: BigNumber.from(100),
    bonusPeriodSec: BigNumber.from('1'),
    initialSharesPerToken: BigNumber.from('1000000'),
    unlockSchedules: [
      {
        amount: BigNumber.from('75000000000000000000'),
        durationSec: BigNumber.from('7776000')
      }
    ]
  },
  trancheStart: BigNumber.from(getCurrentTimestamp() + daysToSeconds(1).toNumber()),
  badgerTranches: [
    {
      // Tranche 1
      id: '1',
      startTimeOffset: BigNumber.from(0),
      duration: daysToSeconds(3),
      totalAmount: utils.parseUnits('3000000', 'ether'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        }
      ]
    },
    {
      // Tranche 1b
      id: '1b',
      startTimeOffset: daysToSeconds(3),
      duration: daysToSeconds(4),
      totalAmount: utils.parseUnits('3000000', 'ether'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        }
      ]
    },
    {
      // Tranche 2
      id: '2',
      startTimeOffset: daysToSeconds(7),
      duration: daysToSeconds(7),
      totalAmount: utils.parseUnits('3000000', 'ether'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        },
        // New Assets
        {
          asset: PoolAssets.LP_BAL_CRV_BAL_RENBTC
        },
        {
          asset: PoolAssets.CRV_LP_renbtc
        },
        {
          asset: PoolAssets.BAL_LP_wbtc_WETH
        },
        {
          asset: PoolAssets.Wbtc
        },
        {
          asset: PoolAssets.RenBTC
        }
      ]
    },
    {
      // Tranche 3
      id: '3',
      startTimeOffset: daysToSeconds(14),
      duration: daysToSeconds(7),
      totalAmount: utils.parseUnits('1500000', 'ether'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        },
        {
          asset: PoolAssets.LP_BAL_CRV_BAL_RENBTC
        },
        {
          asset: PoolAssets.CRV_LP_renbtc
        },
        {
          asset: PoolAssets.BAL_LP_wbtc_WETH
        },
        {
          asset: PoolAssets.Wbtc
        },
        {
          asset: PoolAssets.RenBTC
        },
        // New Assets
        {
          asset: PoolAssets.CREAM
        },
        {
          asset: PoolAssets.Sbtc
        },
        {
          asset: PoolAssets.Yycurv
        },
        {
          asset: PoolAssets.Yalink
        },
        {
          asset: PoolAssets.LEND
        },
        {
          asset: PoolAssets.UNI_LP_AMPL_weth
        },
        {
          asset: PoolAssets.LP_BAL_BADGER,
          rewardMultiplier: TWO
        }
      ]
    }
  ],
  diggTranches: [
    {
      // Tranche 1
      id: '1',
      startTimeOffset: daysToSeconds(21),
      duration: daysToSeconds(3),
      totalAmount: utils.parseUnits('810', 'gwei'),
      pools: [
        {
          asset: PoolAssets.BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.LP_UNI_BADGER
        },
        {
          asset: PoolAssets.LP_BAL_BADGER
        }
      ]
    },
    {
      // Tranche 1b
      id: '1b',
      startTimeOffset: daysToSeconds(24),
      duration: daysToSeconds(4),
      totalAmount: utils.parseUnits('815', 'gwei'),
      pools: [
        {
          asset: PoolAssets.BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.LP_UNI_BADGER
        },
        {
          asset: PoolAssets.LP_BAL_BADGER
        }
      ]
    },
    {
      // Tranche 2
      id: '2',
      startTimeOffset: daysToSeconds(28),
      duration: daysToSeconds(7),
      totalAmount: utils.parseUnits('1000', 'gwei'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        },
        // New Assets
        {
          asset: PoolAssets.Ampl
        },
        {
          asset: PoolAssets.Xampl
        },
        {
          asset: PoolAssets.Based
        },
        {
          asset: PoolAssets.LP_UNI_DIGG,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.RenBTC
        },
        {
          asset: PoolAssets.CREAM
        }
      ]
    },
    {
      // Tranche 3
      id: '3',
      startTimeOffset: daysToSeconds(35),
      duration: daysToSeconds(7),
      totalAmount: utils.parseUnits('500', 'gwei'),
      pools: [
        {
          asset: PoolAssets.LP_UNI_BADGER,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.CRV_LP_sbtc
        },
        {
          asset: PoolAssets.Ampl
        },
        {
          asset: PoolAssets.Xampl
        },
        {
          asset: PoolAssets.Based
        },
        {
          asset: PoolAssets.LP_UNI_DIGG,
          rewardMultiplier: TWO
        },
        {
          asset: PoolAssets.RenBTC
        },
        {
          asset: PoolAssets.CREAM
        },
        // New Assets
        {
          asset: PoolAssets.Sbtc
        },
        {
          asset: PoolAssets.Wbtc
        },
        {
          asset: PoolAssets.Yycurv
        },
        {
          asset: PoolAssets.Yalink
        },
        {
          asset: PoolAssets.LEND
        },
        {
          asset: PoolAssets.LP_BAL_CRV_BAL_RENBTC
        }
      ]
    }
  ]
}

export default {
  RINKEBY,
}
