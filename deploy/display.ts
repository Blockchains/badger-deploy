import { utils } from 'ethers'
import fs from 'fs'

import { RebaseParams, BadgerSystem } from "./BadgerSystem"
import { RebaseDeployment } from "./existing"

export const getSystemParams = async (badger: BadgerSystem) => {
  const params = {} as RebaseParams

  _.set(params, 'baseToken.totalSupply', await badger.baseToken.totalSupply())
  _.set(params, 'baseToken.owner', utils.getAddress(await badger.baseToken.owner()))
  _.set(params, 'baseToken.monetaryPolicy', await badger.baseToken.monetaryPolicy())

  _.set(params, 'supplyPolicy.owner', utils.getAddress(await badger.supplyPolicy.owner()))
  _.set(params, 'supplyPolicy.uFrags', utils.getAddress(await badger.supplyPolicy.uFrags()))
  _.set(params, 'supplyPolicy.deviationThreshold', await badger.supplyPolicy.deviationThreshold())
  _.set(params, 'supplyPolicy.rebaseLag', await badger.supplyPolicy.rebaseLag())
  _.set(params, 'supplyPolicy.minRebaseTimeIntervalSec', await badger.supplyPolicy.minRebaseTimeIntervalSec())
  _.set(params, 'supplyPolicy.rebaseWindowOffsetSec', await badger.supplyPolicy.rebaseWindowOffsetSec())
  _.set(params, 'supplyPolicy.rebaseWindowLengthSec', await badger.supplyPolicy.rebaseWindowLengthSec())
  _.set(params, 'supplyPolicy.epoch', await badger.supplyPolicy.epoch())
  _.set(params, 'supplyPolicy.orchestrator', utils.getAddress(await badger.supplyPolicy.orchestrator()))

  _.set(params, 'marketOracle.owner', utils.getAddress(await badger.marketMedianOracle.owner()))
  _.set(params, 'marketOracle.reportExpirationTimeSec', await badger.marketMedianOracle.reportExpirationTimeSec())
  _.set(params, 'marketOracle.reportDelaySec', await badger.marketMedianOracle.reportDelaySec())
  _.set(params, 'marketOracle.minimumProviders', await badger.marketMedianOracle.minimumProviders())

  _.set(params, 'cpiOracle.owner', utils.getAddress(await badger.cpiMedianOracle.owner()))
  _.set(params, 'cpiOracle.reportExpirationTimeSec', await badger.cpiMedianOracle.reportExpirationTimeSec())
  _.set(params, 'cpiOracle.reportDelaySec', await badger.cpiMedianOracle.reportDelaySec())
  _.set(params, 'cpiOracle.minimumProviders', await badger.cpiMedianOracle.minimumProviders())

  _.set(params, 'orchestrator.owner', await badger.orchestrator.owner())
  _.set(params, 'orchestrator.policy', await badger.orchestrator.policy())

  return params
}

export async function toJson(badger: BadgerSystem, network: string) {
    const deployed: RebaseDeployment = {
      rebaseSystem: {
        baseToken: badger.baseToken.address,
        baseTokenLogic: badger.baseTokenLogic.address,
        supplyPolicy: badger.supplyPolicy.address,
        supplyPolicyLogic: badger.supplyPolicyLogic.address,
        orchestrator: badger.orchestrator.address,
        daoAgent: badger.daoAgent,
        daoFinance: badger.daoFinance,
        proxyAdmin: badger.proxyAdmin,
        marketMedianOracle: badger.marketMedianOracle.address,
        cpiMedianOracle: badger.cpiMedianOracle.address,
        constantOracle: badger.constantOracle.address ? badger.constantOracle.address : ZERO_ADDRESS,
        daoGovernanceToken: badger.daoGovernanceToken,
        rebaseBtcBaseOracle: badger.rebaseBtcBaseOracle.address,
        tokenGeyser: badger.tokenGeyser.address ? badger.tokenGeyser.address : ZERO_ADDRESS
      },
      externalContracts: {
        uniswapPool: badger.uniswapPool.address ? badger.uniswapPool.address : ZERO_ADDRESS,
        uniswapV2Router: badger.uniswapV2Router.address,
        uniswapV2Factory: badger.uniswapV2Factory.address,
        weth: badger.weth.address,
        stakingTokenAddress: badger.uniswapPool.address ? badger.uniswapPool.address : ZERO_ADDRESS
      }
    }

    const json = JSON.stringify(deployed)
    fs.writeFileSync(`${network}.json`, json)
    console.log(`Exported deploy to JSON ${network}.json`)
  }