import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { Contract, Signer, providers, BigNumber } from 'ethers'
import { RebaseConfig } from './config'
import * as _ from 'lodash'

// Rebase Core
import UFragments from '../dependencies/uFragments/build/contracts/UFragments.json'
import UFragmentsPolicy from '../dependencies/uFragments/build/contracts/UFragmentsPolicy.json'
import Orchestrator from '../dependencies/uFragments/build/contracts/Orchestrator.json'

// Oracles
import MedianOracle from '../dependencies/market-oracle/build/contracts/MedianOracle.json'
import ExampleOracleSimple from '../dependencies/uniswap-v2-periphery/build/ExampleOracleSimple.json'
import ConstantOracle from '../dependencies/rebase-oracle/artifacts/ConstantOracle.json'
import RebaseOracleBridge from '../dependencies/rebase-oracle/artifacts/RebaseOracleBridge.json'
import AggregatorInterface from '../dependencies/rebase-oracle/artifacts/AggregatorInterface.json'

// Tokens
import IERC20 from '../dependencies/rebase-oracle/artifacts/IERC20.json'
import WETH9 from '../dependencies/uniswap-v2-periphery/build/WETH9.json'

// Liquidity
import UniswapV2Pair from '../dependencies/uniswap-v2-core/build/UniswapV2Pair.json'
import UniswapV2Factory from '../dependencies/uniswap-v2-core/build/UniswapV2Factory.json'
import UniswapV2Router02 from '../dependencies/uniswap-v2-periphery/build/UniswapV2Router02.json'
import UniswapV2ERC20 from '../dependencies/uniswap-v2-core/build/UniswapV2ERC20.json'
import { v2Fixture } from '../dependencies/uniswap-v2-periphery/test/shared/fixtures'
import { deployUniswapSystem } from './uniswap/deploy'

// Geyser
import TokenGeyser from '../dependencies/token-geyser/build/contracts/TokenGeyser.json'
import TokenPool from '../dependencies/token-geyser/build/contracts/TokenPool.json'

export interface RebaseParams {
  baseToken: {
    owner: string
    monetaryPolicy: string
    totalSupply: BigNumber
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
  marketOracle: {
    owner: string
    providers: string[]
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  cpiOracle: {
    owner: string
    providers: string[]
    reportExpirationTimeSec: BigNumber
    reportDelaySec: BigNumber
    minimumProviders: BigNumber
  }
  orchestrator: {
    owner: string
    policy: string
    transactions: string[]
  }
}

const overrides = {
  gasLimit: 9999999
}

export class RebaseSystem {
  // Rebase Core
  baseToken!: Contract
  baseTokenLogic!: Contract
  supplyPolicy!: Contract
  supplyPolicyLogic!: Contract
  orchestrator!: Contract

  // Admin
  systemOwner!: string
  proxyAdmin!: Contract

  // Oracles
  marketMedianOracle!: Contract
  cpiMedianOracle!: Contract
  constantOracle!: Contract
  uniswapPoolOracle!: Contract
  chainlinkBtcEthOracle!: Contract
  rebaseEthBaseOracle!: Contract

  // Uniswap
  uniswapPool!: Contract
  uniswapV2Router!: Contract
  uniswapV2Factory!: Contract

  // External Tokens
  weth!: Contract
  stablecoin!: Contract

  // Geyser
  stakingTokenAddress!: string
  distributionTokenAddress!: string
  tokenGeyser!: Contract
  deployed!: boolean

  async deploySystem(config: RebaseConfig, provider: providers.BaseProvider, deployer: Signer) {
    const { externalContracts, rebaseParams, marketOracleParams, cpiOracleParams } = config

    const deployerAddress = await deployer.getAddress()

    this.systemOwner = externalContracts.systemOwner

    if (config.network === 'local') {
      const uniswap = await deployUniswapSystem(deployer)
      this.uniswapV2Factory = uniswap.factoryV2
      this.uniswapV2Router = uniswap.router02
      this.weth = uniswap.WETH
      this.stablecoin = uniswap.token0
      console.log('Deployed local Uniswap system ✔️')
    } else {
      await this.connectUniswapSystem(config, deployer)
      console.log('Connected to uniswap system ✔️')
    }

    this.baseToken = await deployContract(deployer, UFragments)
    this.supplyPolicy = await deployContract(deployer, UFragmentsPolicy)
    this.orchestrator = await deployContract(deployer, Orchestrator, [this.supplyPolicy.address])
    console.log(`Deployed core contracts ✔
    baseToken: ${this.baseToken.address}
    supplyPolicy: ${this.supplyPolicy.address}
    orchestrator: ${this.orchestrator.address}
    `)

    this.marketMedianOracle = await deployContract(deployer, MedianOracle, [
      marketOracleParams.reportExpirationTimeSec,
      marketOracleParams.reportDelaySec,
      marketOracleParams.minimumProviders
    ])
    this.cpiMedianOracle = await deployContract(deployer, MedianOracle, [
      cpiOracleParams.reportExpirationTimeSec,
      cpiOracleParams.reportDelaySec,
      cpiOracleParams.minimumProviders
    ])
    console.log(`Deployed median oracles ✔️
    marketMedianOracle: ${this.marketMedianOracle.address}
    cpiMedianOracle: ${this.cpiMedianOracle.address}
    `)

    // Sends full initial supply to msg.sender in initialize();
    await this.baseToken.functions['initialize(address)'](deployerAddress) // TODO: Name, symbol, decimals are hardcoded
    await this.baseToken.setMonetaryPolicy(this.supplyPolicy.address)
    console.log('Configured base token ✔️')

    // The DAO will need to set all of these, unless an initial owner is set for deployment which initializes all parameters and then transfers functionality to the DAO, like it does here
    await this.supplyPolicy.functions['initialize(address,address,uint256)'](
      deployerAddress,
      this.baseToken.address,
      rebaseParams.baseCpi
    )
    console.log('Configured supply policy ✔️')

    await this.supplyPolicy.setCpiOracle(this.cpiMedianOracle.address)
    await this.supplyPolicy.setMarketOracle(this.marketMedianOracle.address)
    await this.supplyPolicy.setDeviationThreshold(rebaseParams.deviationThreshold)
    await this.supplyPolicy.setOrchestrator(this.orchestrator.address)
    await this.supplyPolicy.setRebaseLag(rebaseParams.rebaseLag)
    await this.supplyPolicy.setRebaseTimingParameters(
      rebaseParams.minRebaseTimeIntervalSec,
      rebaseParams.rebaseWindowOffsetSec,
      rebaseParams.rebaseWindowLengthSec
    )

    this.deployed = true
  }

  async deployUniswapPool(deployer: Signer) {
    await this.uniswapV2Factory.createPair(this.weth.address, this.baseToken.address)
    const pairAddress = await this.uniswapV2Factory.getPair(this.weth.address, this.baseToken.address)

    this.uniswapPool = new Contract(pairAddress, UniswapV2Pair.abi, deployer)
    this.stakingTokenAddress = pairAddress
    console.log(`Deployed Uniswap WETH-BASE pool ✔️
    uniswapPool: ${pairAddress}`)
  }

  async deployDataSources(config: RebaseConfig, deployer: Signer) {
    const { externalContracts, rebaseParams, marketOracleParams, cpiOracleParams } = config

    this.constantOracle = await deployContract(deployer, ConstantOracle, [
      rebaseParams.baseCpi,
      this.cpiMedianOracle.address
    ])

    this.uniswapPoolOracle = await deployContract(deployer, ExampleOracleSimple, [
      this.uniswapV2Factory.address,
      this.weth.address,
      this.baseToken.address
    ])

    this.chainlinkBtcEthOracle = new Contract(externalContracts.chainlinkBtcEth, AggregatorInterface.abi, deployer)

    this.rebaseEthBaseOracle = await deployContract(deployer, RebaseOracleBridge, [
      this.uniswapPoolOracle.address,
      this.chainlinkBtcEthOracle.address,
      this.marketMedianOracle.address,
      this.baseToken.address
    ])

    await this.cpiMedianOracle.addProvider(this.constantOracle.address)
    await this.marketMedianOracle.addProvider(this.rebaseEthBaseOracle.address)
  }

  // Transfer tokens + ownership of all contracts to system owner
  async transferToSystemOwner() {
    const initialSupply = await this.baseToken.totalSupply()
    await this.baseToken.transfer(this.systemOwner, initialSupply)

    this.baseToken.transferOwnership(this.systemOwner)
    this.supplyPolicy.transferOwnership(this.systemOwner)
    this.orchestrator.transferOwnership(this.systemOwner)
    this.cpiMedianOracle.transferOwnership(this.systemOwner)
    this.marketMedianOracle.transferOwnership(this.systemOwner)
  }

  async connectUniswapSystem(config: RebaseConfig, deployer: Signer) {
    this.uniswapV2Router = new Contract(config.externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer)
    this.uniswapV2Factory = new Contract(config.externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer)
    this.weth = new Contract(config.externalContracts.weth, IERC20.abi, deployer)
    this.stablecoin = new Contract(config.externalContracts.dai, IERC20.abi, deployer)
  }

  async deployGeyser(config: RebaseConfig, deployer: Signer) {
    this.distributionTokenAddress = this.baseToken.address // TODO: Let this be the goverance token
    const { tokenGeyser } = config
    this.tokenGeyser = await deployContract(deployer, TokenGeyser, [
      this.stakingTokenAddress,
      this.distributionTokenAddress,
      tokenGeyser.maxUnlockSchedules,
      tokenGeyser.startBonus,
      tokenGeyser.bonusPeriodSec,
      tokenGeyser.initialSharesPerToken
    ], overrides)
    console.log(`Deployed Token Geyser ✔️
    tokenGeyser: ${this.tokenGeyser.address}`)
  }

  async getCurrentParams() {
    if (!this.deployed) {
      throw new Error('Attempting to fetch live paramaters before deployment')
    }
    const params = {} as RebaseParams

    _.set(params, 'baseToken.totalSupply', await this.baseToken.totalSupply())
    _.set(params, 'baseToken.owner', await this.baseToken.owner())
    _.set(params, 'baseToken.monetaryPolicy', await this.baseToken.monetaryPolicy())

    _.set(params, 'supplyPolicy.owner', await this.supplyPolicy.owner())
    _.set(params, 'supplyPolicy.uFrags', await this.supplyPolicy.uFrags())
    _.set(params, 'supplyPolicy.deviationThreshold', await this.supplyPolicy.deviationThreshold())
    _.set(params, 'supplyPolicy.rebaseLag', await this.supplyPolicy.rebaseLag())
    _.set(params, 'supplyPolicy.minRebaseTimeIntervalSec', await this.supplyPolicy.minRebaseTimeIntervalSec())
    _.set(params, 'supplyPolicy.rebaseWindowOffsetSec', await this.supplyPolicy.rebaseWindowOffsetSec())
    _.set(params, 'supplyPolicy.rebaseWindowLengthSec', await this.supplyPolicy.rebaseWindowLengthSec())
    _.set(params, 'supplyPolicy.epoch', await this.supplyPolicy.epoch())
    _.set(params, 'supplyPolicy.orchestrator', await this.supplyPolicy.orchestrator())

    _.set(params, 'marketOracle.owner', await this.marketMedianOracle.owner())
    _.set(params, 'marketOracle.reportExpirationTimeSec', await this.marketMedianOracle.reportExpirationTimeSec())
    _.set(params, 'marketOracle.reportDelaySec', await this.marketMedianOracle.reportDelaySec())
    _.set(params, 'marketOracle.minimumProviders', await this.marketMedianOracle.minimumProviders())

    _.set(params, 'cpiOracle.owner', await this.cpiMedianOracle.owner())
    _.set(params, 'cpiOracle.reportExpirationTimeSec', await this.cpiMedianOracle.reportExpirationTimeSec())
    _.set(params, 'cpiOracle.reportDelaySec', await this.cpiMedianOracle.reportDelaySec())
    _.set(params, 'cpiOracle.minimumProviders', await this.cpiMedianOracle.minimumProviders())

    _.set(params, 'orchestrator.owner', await this.orchestrator.owner())
    _.set(params, 'orchestrator.policy', await this.orchestrator.policy())

    return params
  }
}
