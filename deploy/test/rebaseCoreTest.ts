import { expect } from 'chai'
import { utils } from 'ethers'
import { SystemConfig } from '../config'
import { BadgerSystem, RebaseParams } from '../BadgerSystem'

// TODO: Handling gaps in array
// export const getArrayElements = async (contract: Contract, functionName: string) => {
//     let i = 0;
//     let foundEnd = false;
//     while (!foundEnd) {
//         const element = await contract.functions['functionName'](i);
//         if (element === 0)
//         i++;
//     }
// }

export const confirmRebaseParams = async (
  config: SystemConfig,
  rebaseParams: RebaseParams,
  rebaseSystem: BadgerSystem
) => {
  // expect(rebaseParams.baseToken.totalSupply).to.be.eq(config.)

  expect(rebaseParams.baseToken.owner, 'baseToken.owner').to.be.eq(utils.getAddress(config.externalContracts.daoAgent))
  expect(rebaseParams.baseToken.monetaryPolicy, 'baseToken.monetaryPolicy').to.be.eq(
    utils.getAddress(rebaseSystem.supplyPolicy.address)
  )

  expect(rebaseParams.supplyPolicy.owner, 'supplyPolicy.owner').to.be.eq(
    utils.getAddress(config.externalContracts.daoAgent)
  )
  expect(rebaseParams.supplyPolicy.uFrags, 'supplyPolicy.uFrags').to.be.eq(
    utils.getAddress(rebaseSystem.baseToken.address)
  )
  expect(rebaseParams.supplyPolicy.deviationThreshold, 'supplyPolicy.deviationThreshold').to.be.eq(
    config.rebaseParams.deviationThreshold
  )
  expect(rebaseParams.supplyPolicy.rebaseLag, 'supplyPolicy.rebaseLag').to.be.eq(config.rebaseParams.rebaseLag)
  expect(rebaseParams.supplyPolicy.minRebaseTimeIntervalSec, 'supplyPolicy.minRebaseTimeIntervalSec').to.be.eq(
    config.rebaseParams.minRebaseTimeIntervalSec
  )
  expect(rebaseParams.supplyPolicy.rebaseWindowOffsetSec, 'supplyPolicy.rebaseWindowOffsetSec').to.be.eq(
    config.rebaseParams.rebaseWindowOffsetSec
  )
  expect(rebaseParams.supplyPolicy.rebaseWindowLengthSec, 'supplyPolicy.rebaseWindowLengthSec').to.be.eq(
    config.rebaseParams.rebaseWindowLengthSec
  )
  expect(rebaseParams.supplyPolicy.epoch, 'supplyPolicy.epoch').to.be.eq(0)
  expect(rebaseParams.supplyPolicy.orchestrator, 'supplyPolicy.orchestrator').to.be.eq(
    utils.getAddress(rebaseSystem.orchestrator.address)
  )

  expect(rebaseParams.marketOracle.owner, 'marketOracle.owner').to.be.eq(
    utils.getAddress(config.externalContracts.daoAgent)
  )
  expect(rebaseParams.marketOracle.reportExpirationTimeSec, 'marketOracle.reportExpirationTimeSec').to.be.eq(
    config.marketOracleParams.reportExpirationTimeSec
  )
  expect(rebaseParams.marketOracle.reportDelaySec, 'marketOracle.reportDelaySec').to.be.eq(
    config.marketOracleParams.reportDelaySec
  )
  expect(rebaseParams.marketOracle.minimumProviders, 'marketOracle.minimumProviders').to.be.eq(
    config.marketOracleParams.minimumProviders
  )

  expect(rebaseParams.cpiOracle.owner, 'cpiOracle.owner').to.be.eq(
    utils.getAddress(config.externalContracts.daoAgent)
  )
  expect(rebaseParams.cpiOracle.reportExpirationTimeSec, 'cpiOracle.reportExpirationTimeSec').to.be.eq(
    config.cpiOracleParams.reportExpirationTimeSec
  )
  expect(rebaseParams.cpiOracle.reportDelaySec, 'cpiOracle.reportDelaySec').to.be.eq(
    config.cpiOracleParams.reportDelaySec
  )
  expect(rebaseParams.cpiOracle.minimumProviders, 'cpiOracle.minimumProviders').to.be.eq(
    config.cpiOracleParams.minimumProviders
  )

  expect(rebaseParams.orchestrator.owner, 'orchestrator.owner').to.be.eq(
    utils.getAddress(config.externalContracts.daoAgent)
  )
  expect(rebaseParams.orchestrator.policy, 'orchestrator.policy').to.be.eq(
    utils.getAddress(rebaseSystem.supplyPolicy.address)
  )

  expect(rebaseParams.orchestrator.policy, 'orchestrator.policy').to.be.eq(
    utils.getAddress(rebaseSystem.supplyPolicy.address)
  )
}
