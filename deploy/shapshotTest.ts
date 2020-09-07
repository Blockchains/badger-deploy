import { BadgerSystem } from './BadgerSystem'
import { BadgerSnapshot } from './snapshot'
import { SystemConfig } from './badgerConfig'
import { expect } from 'chai'
import { BigNumber, ethers } from 'ethers'

export const compareSnapshotToDeploy = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  compareDiggCore(badgerSystem, snapshot, config)
  compareDiggOracles(badgerSystem, snapshot, config)
  compareDAO(badgerSystem, snapshot, config)
  compareBadgerDistributionPools(badgerSystem, snapshot, config)
  compareDiggDistributionPools(badgerSystem, snapshot, config)
  compareStakingAssets(badgerSystem, snapshot, config)
  compareDaoTimelocks(badgerSystem, snapshot, config)
}

const compareDiggCore = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent

  expect(snapshot.diggCore.diggToken.totalSupply, 'diggToken.totalSupply').to.be.equal(config.diggParams.initialSupply)
  expect(snapshot.diggCore.diggToken.monetaryPolicy, 'diggToken.monetaryPolicy').to.be.equal(badgerSystem.diggCore.supplyPolicy.address)
  expect(snapshot.diggCore.diggToken.owner, 'diggToken.owner').to.be.equal(daoAgent)

  expect(snapshot.diggCore.supplyPolicy.owner, 'supplyPolicy.owner').to.be.equal(daoAgent)
  expect(snapshot.diggCore.supplyPolicy.uFrags, 'supplyPolicy.uFrags').to.be.equal(badgerSystem.diggCore.diggToken.address)
  expect(snapshot.diggCore.supplyPolicy.orchestrator, 'supplyPolicy.orchestrator').to.be.equal(badgerSystem.diggCore.orchestrator.address)
  expect(snapshot.diggCore.supplyPolicy.deviationThreshold, 'supplyPolicy.deviationThreshold').to.be.equal(config.diggParams.deviationThreshold)
  // expect(snapshot.diggCore.supplyPolicy.epoch).to.be.equal(config.diggParams.epoch)
  expect(snapshot.diggCore.supplyPolicy.minRebaseTimeIntervalSec, 'supplyPolicy.minRebaseTimeIntervalSec').to.be.equal(
    config.diggParams.minRebaseTimeIntervalSec
  )
  expect(snapshot.diggCore.supplyPolicy.rebaseLag, 'supplyPolicy.rebaseLag').to.be.equal(config.diggParams.rebaseLag)
  expect(snapshot.diggCore.supplyPolicy.rebaseWindowLengthSec, 'supplyPolicy.rebaseWindowLengthSec').to.be.equal(config.diggParams.rebaseWindowLengthSec)
  expect(snapshot.diggCore.supplyPolicy.rebaseWindowOffsetSec, 'supplyPolicy.rebaseWindowOffsetSec').to.be.equal(config.diggParams.rebaseWindowOffsetSec)

  expect(snapshot.diggCore.orchestrator.owner, 'orchestrator.owner').to.be.equal(daoAgent)
  expect(snapshot.diggCore.orchestrator.policy, 'orchestrator.policy').to.be.equal(badgerSystem.diggCore.supplyPolicy.address)
  expect(snapshot.diggCore.orchestrator.transactions, 'orchestrator.transactions').to.deep.equal([] as string[])
}

const compareDiggOracles = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent

  expect(snapshot.diggOracles.marketMedianOracle.owner, 'marketMedianOracle.owner').to.be.equal(daoAgent)
  expect(snapshot.diggOracles.marketMedianOracle.providers, 'marketMedianOracle.providers').to.deep.equal([
    badgerSystem.diggOracles.centralizedMarketOracle.address
  ])
  expect(snapshot.diggOracles.marketMedianOracle.minimumProviders, 'marketMedianOracle.minimumProviders').to.be.equal(
    config.marketOracleParams.minimumProviders
  )
  expect(snapshot.diggOracles.marketMedianOracle.reportDelaySec, 'marketMedianOracle.reportDelaySec').to.be.equal(config.marketOracleParams.reportDelaySec)
  expect(snapshot.diggOracles.marketMedianOracle.reportExpirationTimeSec, 'marketMedianOracle.reportExpirationTimeSec').to.be.equal(
    config.marketOracleParams.reportExpirationTimeSec
  )
  expect(snapshot.diggOracles.marketMedianOracle.providersSize, 'marketMedianOracle.providersSize').to.be.equal(
    BigNumber.from(1)
  )

  expect(snapshot.diggOracles.cpiMedianOracle.owner, 'cpiMedianOracle.owner').to.be.equal(daoAgent)
  expect(snapshot.diggOracles.cpiMedianOracle.providers, 'cpiMedianOracle.providers').to.deep.equal([badgerSystem.diggOracles.constantOracle.address])
  expect(snapshot.diggOracles.cpiMedianOracle.minimumProviders, 'cpiMedianOracle.minimumProviders').to.be.equal(config.cpiOracleParams.minimumProviders)
  expect(snapshot.diggOracles.cpiMedianOracle.reportDelaySec, 'cpiMedianOracle.reportDelaySec').to.be.equal(config.cpiOracleParams.reportDelaySec)
  expect(snapshot.diggOracles.cpiMedianOracle.reportExpirationTimeSec, 'cpiMedianOracle.reportExpirationTimeSec').to.be.equal(
    config.cpiOracleParams.reportExpirationTimeSec
  )
  expect(snapshot.diggOracles.cpiMedianOracle.providersSize, 'cpiMedianOracle.providersSize').to.be.equal(
    BigNumber.from(1)
  )


  expect(snapshot.diggOracles.centralizedMarketOracle.owners, 'centralizedMarketOracle.owners').to.deep.equal([badgerSystem.deployerAddress])
  expect(snapshot.diggOracles.centralizedMarketOracle.threshold, 'centralizedMarketOracle.threshold').to.be.equal(BigNumber.from(1))

  expect(snapshot.diggOracles.constantOracle.value, 'constantOracle.value').to.be.equal(ethers.utils.parseEther('1'))
  expect(snapshot.diggOracles.constantOracle.medianOracle, 'constantOracle.medianOracle').to.be.equal(
    badgerSystem.diggOracles.cpiMedianOracle.address
  )
}

const compareDAO = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent
}

const compareBadgerDistributionPools = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent

  const numBadgerTranches = snapshot.badgerDistributionPools.tranches.length
  const expectedBadgerTranches = config.badgerTranches.length

  expect(numBadgerTranches).to.be.equal(expectedBadgerTranches)

  for (let i = 0; i < numBadgerTranches; i++) {
    const trancheSnapshot = snapshot.badgerDistributionPools.tranches[i]
    const trancheConfig = config.badgerTranches[i]

    expect(trancheSnapshot.duration, `badger tranche ${i}: duration`).to.be.equal(trancheConfig.duration)
    expect(trancheSnapshot.id, `tranche ${i}: id`).to.be.equal(trancheConfig.id)
    // TODO: Pool Comparison
    expect(trancheSnapshot.startTimeOffset, `badger tranche ${i}: startTimeOffset`).to.be.equal(trancheConfig.startTimeOffset)
    expect(trancheSnapshot.totalAmount, `badger tranche ${i}: totalAmount`).to.be.equal(trancheConfig.totalAmount)
    expect(trancheSnapshot.pools.length, `badger tranche ${i}: pools.length`).to.be.equal(trancheConfig.pools.length)
  }

  for (const tranche of snapshot.badgerDistributionPools.tranches) {
    // expect(tranche.duration).to.be.equal(config.trancheStart)
  }
}

const compareDiggDistributionPools = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent
}

// TODO: When Mainnet, compare to real contracts
const compareStakingAssets = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent
}

const compareDaoTimelocks = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.badgerDAO.daoAgent

  expect(snapshot.daoTimelocks.badgerTimelock.beneficiary, 'daoTimelocks.badgerTimelock.beneficiary').to.be.equal(daoAgent)
  expect(snapshot.daoTimelocks.badgerTimelock.locked, 'daoTimelocks.badgerTimelock.locked').to.be.equal(config.tokenLockParams.badgerLockAmount)
  // expect(snapshot.daoTimelocks.badgerTimelock.releaseTime, 'daoTimelocks.badgerTimelock.releaseTime').to.be.equal(
  //   config.trancheStart.add(config.tokenLockParams.lockDuration)
  // )
  expect(snapshot.daoTimelocks.badgerTimelock.token, 'daoTimelocks.badgerTimelock.token').to.be.equal(badgerSystem.badgerDAO.badgerToken.address)

  expect(snapshot.daoTimelocks.diggTimelock.beneficiary, 'daoTimelocks.diggTimelock.beneficiary').to.be.equal(daoAgent)
  expect(snapshot.daoTimelocks.diggTimelock.locked, 'daoTimelocks.diggTimelock.locked').to.be.equal(config.tokenLockParams.diggLockAmount)
  // expect(snapshot.daoTimelocks.diggTimelock.releaseTime, 'daoTimelocks.diggTimelock.releaseTime').to.be.equal(
  //   config.trancheStart.add(config.tokenLockParams.lockDuration)
  // )
  expect(snapshot.daoTimelocks.diggTimelock.token, 'daoTimelocks.diggTimelock.token').to.be.equal(badgerSystem.diggCore.diggToken.address)
}
