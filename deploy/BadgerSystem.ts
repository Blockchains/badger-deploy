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
import { ChainIds, colors } from './deploySystem'

// OZ SDK
import Web3 from 'web3'
import { Contracts, ProxyAdminProject, ZWeb3 } from '@openzeppelin/upgrades'

// Badger DAO
import BadgerDAOTemplate from '../dependency-artifacts/badger-dao/BadgerDAOTemplate.json'
import MiniMeToken from '../dependency-artifacts/badger-dao/MiniMeToken.json'
import Agent from '../dependency-artifacts/badger-dao/Agent.json'
import Voting from '../dependency-artifacts/badger-dao/Voting.json'
import Finance from '../dependency-artifacts/badger-dao/Finance.json'

// Badger Core
import UFragments from '../dependency-artifacts/digg-core/UFragments.json'
import UFragmentsPolicy from '../dependency-artifacts/digg-core/UFragmentsPolicy.json'
import Orchestrator from '../dependency-artifacts/digg-core/Orchestrator.json'

// Oracles
import MedianOracle from '../dependency-artifacts/market-oracle/MedianOracle.json'
import ConstantOracle from '../dependency-artifacts/rebase-oracle/ConstantOracle.json'
import GnosisSafe from '../dependency-artifacts/gnosis-safe/GnosisSafe.json'

// Tokens
import IERC20 from '../dependency-artifacts/rebase-oracle/IERC20.json'
import ERC20PresetMinterPauser from '../dependency-artifacts/openzeppelin-contracts/ERC20PresetMinterPauser.json'
import WETH9 from '../dependency-artifacts/uniswap-v2-periphery/WETH9.json'
import TokenTimelock from '../dependency-artifacts/openzeppelin-contracts/TokenTimelock.json'

// Liquidity
import UniswapV2Pair from '../dependency-artifacts/uniswap-v2-core/UniswapV2Pair.json'
import UniswapV2Factory from '../dependency-artifacts/uniswap-v2-core/UniswapV2Factory.json'
import UniswapV2Router02 from '../dependency-artifacts/uniswap-v2-periphery/UniswapV2Router02.json'
import { deployUniswapSystem } from './uniswap/deploy'

// Geyser
import TokenGeyser from '../dependency-artifacts/badger-geyser/TokenGeyser.json'
import { deployGnosisSafeInfrastructure, deployGnosisSafe } from './gnosis-safe/deploy'
import { deployAndConfigBalancerPool } from './balancer/deploy'
import { formatTime } from './test/helpers/time'
import { getAllPools } from './test/helpers/poolHelpers'
import { deployAragonInfrastructure, deployBadgerDAO } from './aragon/deploy'

export enum PoolSet {
  DIGG,
  BADGER
}

export interface ContractMap {
  [index: string]: Contract
}

export interface Pool {
  asset: PoolAssets
  contract: Contract
  rewardMultiplier?: BigNumber
  special?: Special
}

export interface Tranche {
  id: string
  startTimeOffset: BigNumber
  totalAmount: BigNumber
  duration: BigNumber
  pools: Pool[]
}

export const overrides = {
  gasLimit: 9999999
}

export interface DiggCore {
  diggToken: Contract
  diggTokenLogic: Contract
  supplyPolicy: Contract
  supplyPolicyLogic: Contract
  orchestrator: Contract
}

export interface DiggOracles {
  marketMedianOracle: Contract
  cpiMedianOracle: Contract
  constantOracle: Contract
  centralizedMarketOracle: Contract
}

export interface FakeDAO {
  daoAgent: string
  daoFinance: string
  proxyAdmin: string
  badgerToken: Contract
}

export interface UniswapCore {
  uniswapV2Router: Contract
  uniswapV2Factory: Contract
}

export interface UniswapPools {
  badgerEthPool: Contract
  diggEthPool: Contract
}

export interface BalancerPools {
  badgerEthPool: Contract
  diggEthPool: Contract
}

export interface DistributionPoolSet {
  tranches: Tranche[]
}

export interface StakingAssets {
  [index: string]: Contract
}

export interface DaoTimelocks {
  badgerTimelock: Contract
  diggTimeLock: Contract
}

export class BadgerSystem {
  diggCore!: DiggCore
  diggOracles!: DiggOracles
  fakeDAO!: FakeDAO
  uniswapCore!: UniswapCore
  uniswapPools!: UniswapPools
  balancerPools!: BalancerPools
  weth!: Contract
  badgerDistributionPools!: DistributionPoolSet
  diggDistributionPools!: DistributionPoolSet
  stakingAssets!: StakingAssets
  daoTimelocks!: DaoTimelocks

  config: SystemConfig
  web3: Web3
  deployer: Signer

  constructor(config: SystemConfig, web3: Web3, deployer: Signer) {
    this.config = config
    this.web3 = web3
    this.deployer = deployer

    this.badgerDistributionPools = {} as DistributionPoolSet
    this.diggDistributionPools = {} as DistributionPoolSet
    this.badgerDistributionPools.tranches = []
    this.diggDistributionPools.tranches = []
    this.stakingAssets = {} as StakingAssets
  }

  async deployDAO() {
    const {
      deployer,
      config: { badgerParams, daoParams }
    } = this
    const deployerAddress = await this.deployer.getAddress()
    
    await deployAragonInfrastructure(deployer)
    console.log('aragon infra')
    await deployGnosisSafeInfrastructure(deployer)
    await deployBadgerDAO(deployer, {
      tokenName: daoParams.tokenName,
      tokenSymbol: daoParams.tokenSymbol,
      id: daoParams.id,
      financePeriod: daoParams.financePeriod,
      holders: [deployerAddress],
      stakes:[daoParams.initialSupply],
      votingSettings: [daoParams.supportRequired, daoParams.minAcceptanceQuorum, daoParams.voteDuration],
      useAgentAsVault: daoParams.useAgentAsVault
    })
    console.log('dao')


    const badgerToken = await deployContract(deployer, ERC20PresetMinterPauser, ['Badger', 'BADGER'])
    const tx = await badgerToken.mint(deployerAddress, badgerParams.totalSupply)
    await tx.wait()

    this.fakeDAO = {
      daoAgent: deployerAddress,
      daoFinance: deployerAddress,
      proxyAdmin: deployerAddress,
      badgerToken
    }

    console.log('Deployed DAO')
  }

  async deployCore() {
    const { externalContracts, rebaseSystem, diggParams: diggParams, marketOracleParams, cpiOracleParams } = this.config
    const { deployer } = this
    const deployerAddress = await deployer.getAddress()

    // ZWeb3.initialize(this.web3.currentProvider)

    const baseToken = await deployContract(deployer, UFragments)
    const baseTokenLogic = baseToken
    const supplyPolicy = await deployContract(deployer, UFragmentsPolicy)
    const supplyPolicyLogic = supplyPolicy
    const orchestrator = await deployContract(deployer, Orchestrator, [supplyPolicy.address])

    this.diggCore = {
      diggToken: baseToken,
      diggTokenLogic: baseTokenLogic,
      supplyPolicy,
      supplyPolicyLogic,
      orchestrator
    }

    console.log(`baseToken: ${this.diggCore.diggToken.address}`),
    console.log(`baseTokenLogic: ${this.diggCore.diggTokenLogic.address}`),
    console.log(`supplyPolicy: ${this.diggCore.supplyPolicy.address}`)
    console.log(`supplyPolicyLogic: ${this.diggCore.supplyPolicyLogic.address}`)
    console.log(`orchestrator: ${this.diggCore.orchestrator.address}`)
  }

  async connectOrDeployUniswap() {
    const { config, deployer } = this

    if (this.config.network === ChainIds.LOCAL) {
      const uniswap = await deployUniswapSystem(deployer)
      this.uniswapCore = {
        uniswapV2Factory: uniswap.factoryV2,
        uniswapV2Router: uniswap.router02
      }

      this.weth = await deployContract(deployer, WETH9)
      console.log('Deployed local Uniswap system ✔️')
    } else {
      this.uniswapCore = {
        uniswapV2Router: new Contract(config.externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer),
        uniswapV2Factory: new Contract(config.externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer)
      }
      this.weth = new Contract(config.externalContracts.weth, IERC20.abi, deployer)
      console.log('Connected to uniswap system ✔️')
    }
  }

  async deployDiggOracles() {
    const {
      config: { marketOracleParams, diggParams: diggParams, centralizedOracleParams, cpiOracleParams },
      web3,
      deployer
    } = this
    const deployerAddress = await deployer.getAddress()

    const marketMedianOracle = await deployContract(deployer, MedianOracle, [
      marketOracleParams.reportExpirationTimeSec,
      marketOracleParams.reportDelaySec,
      marketOracleParams.minimumProviders
    ])
    const cpiMedianOracle = await deployContract(deployer, MedianOracle, [
      cpiOracleParams.reportExpirationTimeSec,
      cpiOracleParams.reportDelaySec,
      cpiOracleParams.minimumProviders
    ])

    const constantOracle = await deployContract(deployer, ConstantOracle, [diggParams.baseCpi, cpiMedianOracle.address])

    let centralizedMarketOracle: Contract

    // Use deployer as centralized oracle owner if on local
    if (this.config.network === ChainIds.LOCAL) {
      centralizedMarketOracle = await deployGnosisSafe(deployer, [
        [deployerAddress],
        1,
        ethers.constants.AddressZero,
        '0x',
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero
      ])
    } else {
      // Use owner list from config otherwise
      centralizedMarketOracle = await deployGnosisSafe(deployer, [
        centralizedOracleParams.owners,
        centralizedOracleParams.threshold,
        ethers.constants.AddressZero,
        '0x',
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        '0',
        ethers.constants.AddressZero
      ])
    }

    let tx = await cpiMedianOracle.addProvider(constantOracle.address)
    await tx.wait()
    tx = await marketMedianOracle.addProvider(centralizedMarketOracle.address)
    await tx.wait()

    this.diggOracles = {
      marketMedianOracle,
      cpiMedianOracle,
      constantOracle,
      centralizedMarketOracle
    }

    console.log(`Deployed median oracles ✔️
    marketMedianOracle: ${this.diggOracles.marketMedianOracle.address}
    cpiMedianOracle: ${this.diggOracles.cpiMedianOracle.address}
    `)

    console.log(` added cpi constant oracle: ${this.diggOracles.constantOracle.address}`)
    console.log(` added market centralized oracle: ${this.diggOracles.centralizedMarketOracle.address}`)
  }

  async initializeCore() {
    const { config, deployer } = this
    const { externalContracts, rebaseSystem, diggParams, trancheStart } = config
    const { diggToken: baseToken, supplyPolicy, orchestrator } = this.diggCore
    const { marketMedianOracle, cpiMedianOracle } = this.diggOracles

    const deployerAddress = await deployer.getAddress()
    const rebasePossibleTime = trancheStart.add(diggParams.rebaseDelayAfterStakingStart)

    console.log(`Rebases Possible at: ${rebasePossibleTime} (${formatTime(rebasePossibleTime)})`)

    let tx = await baseToken.functions['initialize(address,uint256)'](deployerAddress, rebasePossibleTime)
    await tx.wait()

    tx = await baseToken.setMonetaryPolicy(supplyPolicy.address)
    await tx.wait()

    console.log('Configured base token ✔️')

    tx = await supplyPolicy.functions['initialize(address,address,uint256)'](
      deployerAddress,
      baseToken.address,
      diggParams.baseCpi
    )
    await tx.wait()

    console.log('Configured supply policy ✔️')

    tx = await supplyPolicy.setCpiOracle(cpiMedianOracle.address)
    await tx.wait()

    tx = await supplyPolicy.setMarketOracle(marketMedianOracle.address)
    await tx.wait()

    tx = await (await supplyPolicy.setDeviationThreshold(diggParams.deviationThreshold)).wait()

    tx = await supplyPolicy.setOrchestrator(orchestrator.address)
    await tx.wait()

    tx = await supplyPolicy.setRebaseLag(diggParams.rebaseLag)
    await tx.wait()

    tx = await supplyPolicy.setRebaseTimingParameters(
      diggParams.minRebaseTimeIntervalSec,
      diggParams.rebaseWindowOffsetSec,
      diggParams.rebaseWindowLengthSec
    )
    await tx.wait()
  }

  async deployUniswapPools() {
    const {
      deployer,
      uniswapCore: { uniswapV2Factory },
      diggCore: { diggToken },
      fakeDAO: { badgerToken }
    } = this

    let tx = await uniswapV2Factory.createPair(this.weth.address, badgerToken.address)
    await tx.wait()
    const badgerEthAddress = await uniswapV2Factory.getPair(badgerToken.address, this.weth.address)

    tx = await uniswapV2Factory.createPair(this.weth.address, diggToken.address)
    await tx.wait()
    const diggEthAddress = await uniswapV2Factory.getPair(diggToken.address, this.weth.address)

    const badgerEthPool = new Contract(badgerEthAddress, UniswapV2Pair.abi, deployer)
    const diggEthPool = new Contract(diggEthAddress, UniswapV2Pair.abi, deployer)

    this.uniswapPools = {
      badgerEthPool,
      diggEthPool
    }

    console.log(`Deployed Uniswap WETH-BADGER pool ✔️
    uniswapPool: ${this.uniswapPools.badgerEthPool.address}`)

    this.stakingAssets[PoolAssets.LP_UNI_BADGER] = this.uniswapPools.badgerEthPool

    console.log(`Deployed Uniswap WETH-DIGG pool ✔️
    uniswapPool: ${this.uniswapPools.diggEthPool.address}`)

    this.stakingAssets[PoolAssets.LP_UNI_DIGG] = this.uniswapPools.diggEthPool

    // Add BADGER to staking assets as well
    this.stakingAssets[PoolAssets.BADGER] = this.fakeDAO.badgerToken
  }

  async deployBalancerPools() {
    const { deployer } = this

    const badgerEthPool = await deployAndConfigBalancerPool(deployer)
    const diggEthPool = await deployAndConfigBalancerPool(deployer)

    this.balancerPools = {
      badgerEthPool,
      diggEthPool
    }

    console.log(`Deployed Balancer WETH-BADGER pool ✔️
      ${this.balancerPools.badgerEthPool.address}`)

    this.stakingAssets[PoolAssets.LP_BAL_BADGER] = this.uniswapPools.badgerEthPool
  }

  // async connectToSystem(deployment: RebaseDeployment, deployer: Signer) {
  //   const { rebaseSystem, externalContracts } = deployment
  //   // Rebase Core
  //   if (rebaseSystem.baseToken) this.baseToken = new Contract(rebaseSystem.baseToken, UFragments.abi, deployer)
  //   if (rebaseSystem.baseTokenLogic)
  //     this.baseTokenLogic = new Contract(rebaseSystem.baseTokenLogic, UFragments.abi, deployer)
  //   if (rebaseSystem.supplyPolicy)
  //     this.supplyPolicy = new Contract(rebaseSystem.supplyPolicy, UFragmentsPolicy.abi, deployer)
  //   if (rebaseSystem.supplyPolicyLogic)
  //     this.supplyPolicyLogic = new Contract(rebaseSystem.supplyPolicyLogic, UFragmentsPolicy.abi, deployer)
  //   if (rebaseSystem.orchestrator)
  //     this.orchestrator = new Contract(rebaseSystem.orchestrator, Orchestrator.abi, deployer)

  //   // Admin
  //   if (rebaseSystem.daoAgent) this.daoAgent = rebaseSystem.daoAgent
  //   if (rebaseSystem.daoFinance) this.daoFinance = rebaseSystem.daoFinance
  //   if (rebaseSystem.proxyAdmin) this.proxyAdmin = rebaseSystem.proxyAdmin

  //   // Oracles
  //   if (rebaseSystem.marketMedianOracle)
  //     this.marketMedianOracle = new Contract(rebaseSystem.marketMedianOracle, MedianOracle.abi, deployer)
  //   if (rebaseSystem.cpiMedianOracle)
  //     this.cpiMedianOracle = new Contract(rebaseSystem.cpiMedianOracle, MedianOracle.abi, deployer)
  //   if (rebaseSystem.constantOracle)
  //     this.constantOracle = new Contract(rebaseSystem.constantOracle, ConstantOracle.abi, deployer)
  //   this.rebaseBtcBaseOracle = new Contract(rebaseSystem.rebaseBtcBaseOracle, ConstantOracle.abi, deployer)
  //   // Uniswap
  //   if (externalContracts.uniswapPool)
  //     this.uniswapPool = new Contract(externalContracts.uniswapPool, UniswapV2Pair.abi, deployer)
  //   if (externalContracts.uniswapV2Router)
  //     this.uniswapV2Router = new Contract(externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer)
  //   if (externalContracts.uniswapV2Factory)
  //     this.uniswapV2Factory = new Contract(externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer)

  //   // External Tokens
  //   if (externalContracts.weth) this.weth = new Contract(externalContracts.weth, WETH9.abi, deployer)

  //   // Geyser
  //   if (externalContracts.stakingTokenAddress) this.stakingTokenAddress = externalContracts.stakingTokenAddress
  //   if (rebaseSystem.daoGovernanceToken) this.daoGovernanceToken = rebaseSystem.daoGovernanceToken
  //   if (rebaseSystem.tokenGeyser) this.tokenGeyser = new Contract(rebaseSystem.tokenGeyser, TokenGeyser.abi, deployer)

  //   this.deployed = true
  // }

  // Transfer tokens + ownership of all contracts to system owner
  async transferToDao() {
    const {
      diggCore: { diggToken: baseToken, supplyPolicy, orchestrator },
      diggOracles: { cpiMedianOracle, marketMedianOracle },
      fakeDAO: { daoAgent }
    } = this
    await baseToken.transferOwnership(daoAgent)
    await supplyPolicy.transferOwnership(daoAgent)
    await orchestrator.transferOwnership(daoAgent)
    await cpiMedianOracle.transferOwnership(daoAgent)
    await marketMedianOracle.transferOwnership(daoAgent)
  }

  async connectOrDeployStakingAssets() {
    const { config, deployer } = this
    const deployerAddress = await deployer.getAddress()

    // let assetContract: Contract
    const stakingAssets = {} as any

    if (config.network === ChainIds.MAINNET) {
      for (const pool of Object.keys(externalPoolAddresses.MAINNET)) {
        const assetContract = new Contract(externalPoolAddresses.MAINNET[pool], IERC20.abi, deployer)
        console.log(`Loading staking asset ${pool} from address ${assetContract.address}`)
        stakingAssets[pool] = assetContract
      }
    } else {
      for (const pool of Object.keys(externalPoolAddresses.MAINNET)) {
        const assetContract = await deployContract(deployer, ERC20PresetMinterPauser, [
          poolAssetMetadata[pool].name,
          poolAssetMetadata[pool].symbol
        ])

        console.log(`Deployed dummy staking asset ${pool} at address ${assetContract.address}`)

        const tx = await assetContract.mint(deployerAddress, utils.parseEther('1000000000'))
        await tx.wait()
        stakingAssets[pool] = assetContract
      }
    }

    this.stakingAssets = stakingAssets
  }

  private getTimelockRelease() {
    const { config } = this
    return config.trancheStart.add(config.tokenLockParams.lockDuration)
  }

  private async deployPoolsForTranche(
    tranche: TrancheConfig,
    distributionToken: Contract,
    tokenDisplayUnit: string
  ): Promise<Pool[]> {
    const { config, deployer } = this
    console.log(`Starting tranche ${tranche.id}`)

    const pools = [] as Pool[]

    const trancheStart = config.trancheStart.add(tranche.startTimeOffset)
    let segments = BigNumber.from(0)

    tranche.pools.forEach(pool => {
      segments = segments.add(pool.rewardMultiplier ? pool.rewardMultiplier : 1)
    })

    console.log(`Total funding divisor for ${tranche.id}: ${segments}`)

    for (const pool of tranche.pools) {
      const assetContract = this.stakingAssets[pool.asset]

      // Deploy pool
      const poolAmount = tranche.totalAmount.mul(pool.rewardMultiplier ? pool.rewardMultiplier : 1).div(segments)

      const poolContract = await deployContract(
        deployer,
        TokenGeyser,
        [
          assetContract.address,
          distributionToken.address,
          config.tokenGeyser.maxUnlockSchedules,
          config.tokenGeyser.startBonus,
          config.tokenGeyser.bonusPeriodSec,
          config.tokenGeyser.initialSharesPerToken,
          trancheStart
        ],
        overrides
      )

      // Add unlock schedule
      let tx = await distributionToken.approve(poolContract.address, ethers.constants.MaxUint256)
      await tx.wait()

      tx = await poolContract.lockTokens(poolAmount, tranche.duration, trancheStart)
      await tx.wait()
      console.log(
        `Deployed distribition pool for tranche ${tranche.id}/${pool.asset} 
          Pool: ${poolContract.address}
          Asset: ${assetContract.address}
          Locked:  ${utils.formatUnits(poolAmount, tokenDisplayUnit)} tokens
          Starts:  ${formatTime(trancheStart)}, for ${tranche.duration} seconds
         `
      )

      pools.push({
        asset: pool.asset,
        contract: poolContract,
        rewardMultiplier: pool.rewardMultiplier ? pool.rewardMultiplier : BigNumber.from(1),
        special: pool.special ? pool.special : undefined
      })
    }
    return pools
  }

  async deployDistributionPools() {
    const {
      config,
      web3,
      deployer,
      fakeDAO: { badgerToken },
      diggCore: { diggToken }
    } = this

    const now = Math.floor(Date.now() / 1000)

    const badgerSupply = await badgerToken.totalSupply()
    const diggSupply = await diggToken.totalSupply()

    console.log('badgerSupply ', badgerSupply.toString())
    console.log('diggSupply ', diggSupply.toString())

    console.log(colors.title('---Deploy BADGER Distribution Pools---'))

    for (const tranche of config.badgerTranches) {
      this.badgerDistributionPools.tranches.push({
        id: tranche.id,
        duration: tranche.duration,
        totalAmount: tranche.totalAmount,
        startTimeOffset: tranche.startTimeOffset,
        pools: await this.deployPoolsForTranche(tranche, badgerToken, 'ether')
      })
    }

    console.log(colors.title('---Deploy DIGG Distribution Pools---'))

    for (const tranche of config.diggTranches) {
      this.diggDistributionPools.tranches.push({
        id: tranche.id,
        duration: tranche.duration,
        totalAmount: tranche.totalAmount,
        startTimeOffset: tranche.startTimeOffset,
        pools: await this.deployPoolsForTranche(tranche, diggToken, 'gwei')
      })
    }
  }
  async deployTokenTimelocks() {
    const {
      config,
      web3,
      deployer,
      fakeDAO: { daoAgent, badgerToken },
      diggCore: { diggToken }
    } = this

    const deployerAddress = await deployer.getAddress()

    const remainingBadger = await badgerToken.balanceOf(deployerAddress)
    const remainingDigg = await badgerToken.balanceOf(deployerAddress)

    // TODO: Convert DAOAgent to Contract when actual DAO
    const badgerTimelock = await deployContract(deployer, TokenTimelock, [
      badgerToken.address,
      daoAgent,
      this.getTimelockRelease()
    ])

    // TODO: Convert DAOAgent to Contract when actual DAO
    const diggTimeLock = await deployContract(deployer, TokenTimelock, [
      diggToken.address,
      daoAgent,
      this.getTimelockRelease()
    ])

    let tx = await badgerToken.approve(badgerTimelock.address, ethers.constants.MaxUint256)
    await tx.wait()

    tx = await badgerToken.transfer(badgerTimelock.address, config.tokenLockParams.badgerLockAmount)
    await tx.wait()

    tx = await diggToken.approve(diggTimeLock.address, ethers.constants.MaxUint256)
    await tx.wait()

    tx = await diggToken.transfer(diggTimeLock.address, config.tokenLockParams.diggLockAmount)
    await tx.wait()

    this.daoTimelocks = {
      badgerTimelock,
      diggTimeLock
    }

    console.log(`Deployed Badger Timelock to ${this.daoTimelocks.badgerTimelock.address})
      Amount Locked: ${utils.formatEther(config.tokenLockParams.badgerLockAmount)}
      Unlocks At   : ${this.getTimelockRelease()}
    `)
    console.log(`Deployed Digg Timelock to ${this.daoTimelocks.diggTimeLock.address}
      Amount Locked: ${utils.formatUnits(config.tokenLockParams.badgerLockAmount, 'gwei')}
      Unlocks At   : ${this.getTimelockRelease()}
    `)
  }

  getDistributionPoolSet(poolSet: PoolSet) {
    switch (poolSet) {
      case PoolSet.DIGG:
        return this.diggDistributionPools
      case PoolSet.BADGER:
        return this.badgerDistributionPools
      default:
        throw new Error(`Invalid pool set specified ${poolSet}`)
    }
  }

  getPoolsByDistributedToken(poolSet: PoolSet) {
    const distPools = this.getDistributionPoolSet(poolSet)

    const pools = [] as Pool[]

    for (const tranche of distPools.tranches) {
      for (const pool of tranche.pools) {
        pools.push(pool)
      }
    }
    return pools
  }

  getStakingContractByAddress(stakingAddress: string): Contract | undefined {
    const assetKey = Object.keys(this.stakingAssets).find(key => {
      return this.stakingAssets[key].address === stakingAddress
    })
    if (assetKey) {
      return this.stakingAssets[assetKey]
    } else {
      return undefined
    }
  }

  getPoolContractByAddress(poolAddress: string): Contract | undefined {
    const pools = getAllPools(this)
    const foundPool = pools.find(pool => pool.contract.address === poolAddress)
    return foundPool ? foundPool.contract : undefined
  }

  getPoolsByTranche(poolSet: PoolSet, trancheId: number) {
    const distPools = this.getDistributionPoolSet(poolSet)
    const tranche = distPools.tranches[trancheId]

    if (!tranche) {
      throw new Error(`Invalid tranche ID specified ${trancheId}`)
    }

    const pools = [] as Pool[]

    for (const pool of tranche.pools) {
      pools.push(pool)
    }

    return pools
  }
}
