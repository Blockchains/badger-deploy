import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { Contract, Signer, providers, BigNumber, utils, EventFilter } from 'ethers'
import { RebaseConfig } from './config'
import * as _ from 'lodash'
import fs from 'fs'

// OZ SDK
import Web3 from 'web3'
import { Contracts, ProxyAdminProject, ZWeb3 } from '@openzeppelin/upgrades'

// Rebase Core
import UFragments from '../dependency-artifacts/uFragments/UFragments.json'
import UFragmentsPolicy from '../dependency-artifacts/uFragments/UFragmentsPolicy.json'
import Orchestrator from '../dependency-artifacts/uFragments/Orchestrator.json'

// Oracles
import MedianOracle from '../dependency-artifacts/market-oracle/MedianOracle.json'
import ExampleOracleSimple from '../dependency-artifacts/uniswap-v2-periphery/ExampleOracleSimple.json'
import ConstantOracle from '../dependency-artifacts/rebase-oracle/ConstantOracle.json'
import RebaseOracleBridge from '../dependency-artifacts/rebase-oracle/RebaseOracleBridge.json'
import AggregatorInterface from '../dependency-artifacts/rebase-oracle/AggregatorInterface.json'
import MultiSigWalletWithDailyLimitFactory from '../dependency-artifacts/gnosis-multisig/MultiSigWalletWithDailyLimitFactory.json'
import MultiSigWalletWithDailyLimit from '../dependency-artifacts/gnosis-multisig/MultiSigWalletWithDailyLimit.json'

// Tokens
import IERC20 from '../dependency-artifacts/rebase-oracle/IERC20.json'
import WETH9 from '../dependency-artifacts/uniswap-v2-periphery/WETH9.json'

// Liquidity
import UniswapV2Pair from '../dependency-artifacts/uniswap-v2-core/UniswapV2Pair.json'
import UniswapV2Factory from '../dependency-artifacts/uniswap-v2-core/UniswapV2Factory.json'
import UniswapV2Router02 from '../dependency-artifacts/uniswap-v2-periphery/UniswapV2Router02.json'
import UniswapV2ERC20 from '../dependency-artifacts/uniswap-v2-core/UniswapV2ERC20.json'
import { deployUniswapSystem } from './uniswap/deploy'

// Geyser
import TokenGeyser from '../dependency-artifacts/token-geyser/TokenGeyser.json'
import TokenPool from '../dependency-artifacts/token-geyser/TokenPool.json'
import { RebaseDeployment } from './existing'
import { ZERO_ADDRESS } from './deploy'

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
  tokenGeyser?: {
    stakingTokenAddress: string
    daoGovernanceToken: string
    maxUnlockSchedules: BigNumber
    startBonus: BigNumber
    bonusPeriodSec: BigNumber
    initialSharesPerToken: BigNumber
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
  daoAgent!: string
  daoFinance!: string
  proxyAdmin!: string

  // Oracles
  marketMedianOracle!: Contract
  cpiMedianOracle!: Contract
  constantOracle!: Contract
  uniswapPoolOracle!: Contract
  chainlinkBtcEthOracle!: Contract
  rebaseBtcBaseOracle!: Contract

  // Uniswap
  uniswapPool!: Contract
  uniswapV2Router!: Contract
  uniswapV2Factory!: Contract

  // External Tokens
  weth!: Contract

  // Geyser
  stakingTokenAddress!: string
  daoGovernanceToken!: string
  tokenGeyser!: Contract
  deployed!: boolean

  async deploySystem(config: RebaseConfig, web3: Web3, deployer: Signer) {
    const { externalContracts, rebaseSystem, rebaseParams, marketOracleParams, cpiOracleParams } = config
    const deployerAddress = await deployer.getAddress()

    ZWeb3.initialize(web3.currentProvider)

    this.daoAgent = externalContracts.daoAgent
    this.daoFinance = externalContracts.daoFinance
    this.rebaseBtcBaseOracle = new Contract(rebaseSystem.rebaseBtcBaseOracle, MultiSigWalletWithDailyLimit.abi, deployer)

    if (config.network === 'local') {
      const uniswap = await deployUniswapSystem(deployer)
      this.uniswapV2Factory = uniswap.factoryV2
      this.uniswapV2Router = uniswap.router02
      this.weth = uniswap.WETH
      console.log('Deployed local Uniswap system ✔️')
    } else {
      await this.connectUniswapSystem(config, deployer)
      console.log('Connected to uniswap system ✔️')
    }

    this.baseToken = new Contract(rebaseSystem.baseToken, UFragments.abi, deployer)
    console.log(`baseToken: ${this.baseToken.address}`),
      (this.baseTokenLogic = new Contract(rebaseSystem.baseTokenLogic, UFragments.abi, deployer))
    console.log(`baseTokenLogic: ${this.baseTokenLogic.address}`),
      (this.supplyPolicy = new Contract(rebaseSystem.supplyPolicy, UFragmentsPolicy.abi, deployer))
    console.log(`supplyPolicy: ${this.supplyPolicy.address}`)
    this.supplyPolicyLogic = new Contract(rebaseSystem.supplyPolicyLogic, UFragmentsPolicy.abi, deployer)
    console.log(`supplyPolicyLogic: ${this.supplyPolicyLogic.address}`)

    this.orchestrator = await deployContract(deployer, Orchestrator, [this.supplyPolicy.address])
    console.log(`orchestrator: ${this.orchestrator.address}`)

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
  }

  async initializeSupplyPolicy(config: RebaseConfig, web3: Web3, deployer: Signer) {
    const { externalContracts, rebaseSystem, rebaseParams, marketOracleParams, cpiOracleParams } = config
    const deployerAddress = await deployer.getAddress()

    let tx = await this.baseToken.setMonetaryPolicy(this.supplyPolicy.address)
    await tx.wait();

    console.log('Configured base token ✔️')

    tx = await this.supplyPolicy.functions['initialize(address,address,uint256)'](
      deployerAddress,
      this.baseToken.address,
      rebaseParams.baseCpi
    )
    await tx.wait();

    console.log('Configured supply policy ✔️')

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  async initializeSystem(config: RebaseConfig, web3: Web3, deployer: Signer) {
    const { externalContracts, rebaseSystem, rebaseParams, marketOracleParams, cpiOracleParams } = config
    const deployerAddress = await deployer.getAddress()

    let tx = await this.supplyPolicy.setCpiOracle(this.cpiMedianOracle.address)
    await tx.wait();

    tx = await this.supplyPolicy.setMarketOracle(this.marketMedianOracle.address)
    await tx.wait();

    tx = await this.supplyPolicy.setDeviationThreshold(rebaseParams.deviationThreshold)
    await tx.wait();

    tx = await this.supplyPolicy.setOrchestrator(this.orchestrator.address)
    await tx.wait();

    tx = await this.supplyPolicy.setRebaseLag(rebaseParams.rebaseLag)
    await tx.wait();

    await this.supplyPolicy.setRebaseTimingParameters(
      rebaseParams.minRebaseTimeIntervalSec,
      rebaseParams.rebaseWindowOffsetSec,
      rebaseParams.rebaseWindowLengthSec
    )
    console.log(6)

    this.deployed = true
  }

  async deployUniswapPool(deployer: Signer) {
    await this.uniswapV2Factory.createPair(this.weth.address, this.baseToken.address)
    console.log(1)
    const pairAddress = await this.uniswapV2Factory.getPair(this.baseToken.address, this.weth.address)
    console.log(2)

    this.uniswapPool = new Contract(pairAddress, UniswapV2Pair.abi, deployer)
    this.stakingTokenAddress = pairAddress
    console.log(`Deployed Uniswap WETH-BASE pool ✔️
    uniswapPool: ${pairAddress}`)
  }

  async toJson(network: string) {
    const deployed: RebaseDeployment = {
      rebaseSystem: {
        baseToken: this.baseToken.address,
        baseTokenLogic: this.baseTokenLogic.address,
        supplyPolicy: this.supplyPolicy.address,
        supplyPolicyLogic: this.supplyPolicyLogic.address,
        orchestrator: this.orchestrator.address,
        daoAgent: this.daoAgent,
        daoFinance: this.daoFinance,
        proxyAdmin: this.proxyAdmin,
        marketMedianOracle: this.marketMedianOracle.address,
        cpiMedianOracle: this.cpiMedianOracle.address,
        constantOracle: this.constantOracle.address ? this.constantOracle.address : ZERO_ADDRESS,
        daoGovernanceToken: this.daoGovernanceToken,
        rebaseBtcBaseOracle: this.rebaseBtcBaseOracle.address,
        tokenGeyser: this.tokenGeyser.address ? this.tokenGeyser.address : ZERO_ADDRESS
      },
      externalContracts: {
        uniswapPool: this.uniswapPool.address ? this.uniswapPool.address : ZERO_ADDRESS,
        uniswapV2Router: this.uniswapV2Router.address,
        uniswapV2Factory: this.uniswapV2Factory.address,
        weth: this.weth.address,
        stakingTokenAddress: this.uniswapPool.address ? this.uniswapPool.address : ZERO_ADDRESS
      }
    }

    const json = JSON.stringify(deployed)
    fs.writeFileSync(`${network}.json`, json)
    console.log(`Exported deploy to JSON ${network}.json`)
  }

  async connectToSystem(deployment: RebaseDeployment, deployer: Signer) {
    const { rebaseSystem, externalContracts } = deployment
    // Rebase Core
    if (rebaseSystem.baseToken) this.baseToken = new Contract(rebaseSystem.baseToken, UFragments.abi, deployer)
    if (rebaseSystem.baseTokenLogic)
      this.baseTokenLogic = new Contract(rebaseSystem.baseTokenLogic, UFragments.abi, deployer)
    if (rebaseSystem.supplyPolicy)
      this.supplyPolicy = new Contract(rebaseSystem.supplyPolicy, UFragmentsPolicy.abi, deployer)
    if (rebaseSystem.supplyPolicyLogic)
      this.supplyPolicyLogic = new Contract(rebaseSystem.supplyPolicyLogic, UFragmentsPolicy.abi, deployer)
    if (rebaseSystem.orchestrator)
      this.orchestrator = new Contract(rebaseSystem.orchestrator, Orchestrator.abi, deployer)

    // Admin
    if (rebaseSystem.daoAgent) this.daoAgent = rebaseSystem.daoAgent
    if (rebaseSystem.daoFinance) this.daoFinance = rebaseSystem.daoFinance
    if (rebaseSystem.proxyAdmin) this.proxyAdmin = rebaseSystem.proxyAdmin

    // Oracles
    if (rebaseSystem.marketMedianOracle)
      this.marketMedianOracle = new Contract(rebaseSystem.marketMedianOracle, MedianOracle.abi, deployer)
    if (rebaseSystem.cpiMedianOracle)
      this.cpiMedianOracle = new Contract(rebaseSystem.cpiMedianOracle, MedianOracle.abi, deployer)
    if (rebaseSystem.constantOracle)
      this.constantOracle = new Contract(rebaseSystem.constantOracle, ConstantOracle.abi, deployer)
      this.rebaseBtcBaseOracle = new Contract(rebaseSystem.rebaseBtcBaseOracle, ConstantOracle.abi, deployer)
    // Uniswap
    if (externalContracts.uniswapPool)
      this.uniswapPool = new Contract(externalContracts.uniswapPool, UniswapV2Pair.abi, deployer)
    if (externalContracts.uniswapV2Router)
      this.uniswapV2Router = new Contract(externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer)
    if (externalContracts.uniswapV2Factory)
      this.uniswapV2Factory = new Contract(externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer)

    // External Tokens
    if (externalContracts.weth) this.weth = new Contract(externalContracts.weth, WETH9.abi, deployer)

    // Geyser
    if (externalContracts.stakingTokenAddress) this.stakingTokenAddress = externalContracts.stakingTokenAddress
    if (rebaseSystem.daoGovernanceToken) this.daoGovernanceToken = rebaseSystem.daoGovernanceToken
    if (rebaseSystem.tokenGeyser) this.tokenGeyser = new Contract(rebaseSystem.tokenGeyser, TokenGeyser.abi, deployer)

    this.deployed = true
  }

  async deployDataSources(web3: Web3, config: RebaseConfig, deployer: Signer) {
    const { externalContracts, rebaseParams, marketOracleParams, cpiOracleParams } = config
    const deployerAddress = await deployer.getAddress()

    this.constantOracle = await deployContract(deployer, ConstantOracle, [
      rebaseParams.baseCpi,
      this.cpiMedianOracle.address
    ])

    console.log(`deployed constant oracle: ${this.constantOracle.address}`)
    console.log(`added cpi source: ${this.constantOracle.address}`)
    console.log(`added market source: ${this.rebaseBtcBaseOracle.address}`)

    await this.cpiMedianOracle.addProvider(this.constantOracle.address)
    await this.marketMedianOracle.addProvider(this.rebaseBtcBaseOracle.address)
  }

  // Transfer tokens + ownership of all contracts to system owner
  async transferToDao() {
    await this.baseToken.transferOwnership(this.daoAgent)
    await this.supplyPolicy.transferOwnership(this.daoAgent)
    await this.orchestrator.transferOwnership(this.daoAgent)
    await this.cpiMedianOracle.transferOwnership(this.daoAgent)
    await this.marketMedianOracle.transferOwnership(this.daoAgent)
    await this.tokenGeyser.transferOwnership(this.daoAgent)
  }

  async connectUniswapSystem(config: RebaseConfig, deployer: Signer) {
    this.uniswapV2Router = new Contract(config.externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer)
    this.uniswapV2Factory = new Contract(config.externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer)
    this.weth = new Contract(config.externalContracts.weth, IERC20.abi, deployer)
  }

  async deployGeyser(config: RebaseConfig, deployer: Signer) {
    const { tokenGeyser } = config
    this.tokenGeyser = await deployContract(
      deployer,
      TokenGeyser,
      [
        this.stakingTokenAddress,
        this.daoGovernanceToken,
        tokenGeyser.maxUnlockSchedules,
        tokenGeyser.startBonus,
        tokenGeyser.bonusPeriodSec,
        tokenGeyser.initialSharesPerToken
      ],
      overrides
    )
    console.log(`Deployed Token Geyser ✔️
    tokenGeyser: ${this.tokenGeyser.address}`)
  }

  async getCurrentParams() {
    if (!this.deployed) {
      throw new Error('Attempting to fetch live paramaters before deployment')
    }
    const params = {} as RebaseParams

    _.set(params, 'baseToken.totalSupply', await this.baseToken.totalSupply())
    _.set(params, 'baseToken.owner', utils.getAddress(await this.baseToken.owner()))
    _.set(params, 'baseToken.monetaryPolicy', await this.baseToken.monetaryPolicy())

    _.set(params, 'supplyPolicy.owner', utils.getAddress(await this.supplyPolicy.owner()))
    _.set(params, 'supplyPolicy.uFrags', utils.getAddress(await this.supplyPolicy.uFrags()))
    _.set(params, 'supplyPolicy.deviationThreshold', await this.supplyPolicy.deviationThreshold())
    _.set(params, 'supplyPolicy.rebaseLag', await this.supplyPolicy.rebaseLag())
    _.set(params, 'supplyPolicy.minRebaseTimeIntervalSec', await this.supplyPolicy.minRebaseTimeIntervalSec())
    _.set(params, 'supplyPolicy.rebaseWindowOffsetSec', await this.supplyPolicy.rebaseWindowOffsetSec())
    _.set(params, 'supplyPolicy.rebaseWindowLengthSec', await this.supplyPolicy.rebaseWindowLengthSec())
    _.set(params, 'supplyPolicy.epoch', await this.supplyPolicy.epoch())
    _.set(params, 'supplyPolicy.orchestrator', utils.getAddress(await this.supplyPolicy.orchestrator()))

    _.set(params, 'marketOracle.owner', utils.getAddress(await this.marketMedianOracle.owner()))
    _.set(params, 'marketOracle.reportExpirationTimeSec', await this.marketMedianOracle.reportExpirationTimeSec())
    _.set(params, 'marketOracle.reportDelaySec', await this.marketMedianOracle.reportDelaySec())
    _.set(params, 'marketOracle.minimumProviders', await this.marketMedianOracle.minimumProviders())

    _.set(params, 'cpiOracle.owner', utils.getAddress(await this.cpiMedianOracle.owner()))
    _.set(params, 'cpiOracle.reportExpirationTimeSec', await this.cpiMedianOracle.reportExpirationTimeSec())
    _.set(params, 'cpiOracle.reportDelaySec', await this.cpiMedianOracle.reportDelaySec())
    _.set(params, 'cpiOracle.minimumProviders', await this.cpiMedianOracle.minimumProviders())

    _.set(params, 'orchestrator.owner', await this.orchestrator.owner())
    _.set(params, 'orchestrator.policy', await this.orchestrator.policy())

    return params
  }
}
