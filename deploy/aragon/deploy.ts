import { BigNumber } from "ethers"

import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { Contract, Signer, providers, BigNumber, utils, EventFilter } from 'ethers'
import { SystemConfig, PoolAssets, Special, poolAssetMetadata } from './config'
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
import ERC20Detailed from '../dependency-artifacts/uFragments/ERC20Detailed.json'
import WETH9 from '../dependency-artifacts/uniswap-v2-periphery/WETH9.json'

// Liquidity
import UniswapV2Pair from '../dependency-artifacts/uniswap-v2-core/UniswapV2Pair.json'
import UniswapV2Factory from '../dependency-artifacts/uniswap-v2-core/UniswapV2Factory.json'
import UniswapV2Router02 from '../dependency-artifacts/uniswap-v2-periphery/UniswapV2Router02.json'
import UniswapV2ERC20 from '../dependency-artifacts/uniswap-v2-core/UniswapV2ERC20.json'
import { deployUniswapSystem } from './uniswap/deploy'

// Geyser
import TokenGeyser from '../dependency-artifacts/badger-geyser/TokenGeyser.json'
import TokenPool from '../dependency-artifacts/token-geyser/TokenPool.json'
import { RebaseDeployment } from './existing'
import { ZERO_ADDRESS } from './deploy'

export interface FakeDAOParams {
    agent: string;
    finance: string;
    tokenSupply: BigNumber
}


export const deployFakeDAO = async (params: FakeDAOParams) => {

}
