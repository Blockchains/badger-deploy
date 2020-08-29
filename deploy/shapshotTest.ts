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
  const daoAgent = badgerSystem.fakeDAO.daoAgent

  expect(snapshot.diggCore.diggToken.totalSupply).to.be.equal(config.diggParams.initialSupply)
  expect(snapshot.diggCore.diggToken.monetaryPolicy).to.be.equal(badgerSystem.diggCore.supplyPolicy.address)
  expect(snapshot.diggCore.diggToken.owner).to.be.equal(daoAgent)

  expect(snapshot.diggCore.supplyPolicy.owner).to.be.equal(daoAgent)
  expect(snapshot.diggCore.supplyPolicy.uFrags).to.be.equal(badgerSystem.diggCore.diggToken.address)
  expect(snapshot.diggCore.supplyPolicy.orchestrator).to.be.equal(badgerSystem.diggCore.orchestrator.address)
  expect(snapshot.diggCore.supplyPolicy.deviationThreshold).to.be.equal(config.diggParams.deviationThreshold)
  // expect(snapshot.diggCore.supplyPolicy.epoch).to.be.equal(config.diggParams.epoch)
  expect(snapshot.diggCore.supplyPolicy.minRebaseTimeIntervalSec).to.be.equal(
    config.diggParams.minRebaseTimeIntervalSec
  )
  expect(snapshot.diggCore.supplyPolicy.rebaseLag).to.be.equal(config.diggParams.rebaseLag)
  expect(snapshot.diggCore.supplyPolicy.rebaseWindowLengthSec).to.be.equal(config.diggParams.rebaseWindowLengthSec)
  expect(snapshot.diggCore.supplyPolicy.rebaseWindowOffsetSec).to.be.equal(config.diggParams.rebaseWindowOffsetSec)

  expect(snapshot.diggCore.orchestrator.owner).to.be.equal(daoAgent)
  expect(snapshot.diggCore.orchestrator.policy).to.be.equal(badgerSystem.diggCore.supplyPolicy.address)
  expect(snapshot.diggCore.orchestrator.transactions).to.deep.equal([] as string[])
}

const compareDiggOracles = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.fakeDAO.daoAgent

  expect(snapshot.diggOracles.marketMedianOracle.owner).to.be.equal(daoAgent)
  console.log(8)

  expect(snapshot.diggOracles.marketMedianOracle.providers).to.deep.equal([
    badgerSystem.diggOracles.centralizedMarketOracle.address
  ])
  expect(snapshot.diggOracles.marketMedianOracle.minimumProviders).to.be.equal(
    config.marketOracleParams.minimumProviders
  )
  expect(snapshot.diggOracles.marketMedianOracle.reportDelaySec).to.be.equal(config.marketOracleParams.reportDelaySec)
  expect(snapshot.diggOracles.marketMedianOracle.reportExpirationTimeSec).to.be.equal(
    config.marketOracleParams.reportExpirationTimeSec
  )
  expect(snapshot.diggOracles.marketMedianOracle.providersSize).to.be.equal(
    BigNumber.from(1)
  )

  expect(snapshot.diggOracles.cpiMedianOracle.owner).to.be.equal(daoAgent)
  expect(snapshot.diggOracles.cpiMedianOracle.providers).to.deep.equal([badgerSystem.diggOracles.constantOracle.address])
  expect(snapshot.diggOracles.cpiMedianOracle.minimumProviders).to.be.equal(config.cpiOracleParams.minimumProviders)
  expect(snapshot.diggOracles.cpiMedianOracle.reportDelaySec).to.be.equal(config.cpiOracleParams.reportDelaySec)
  expect(snapshot.diggOracles.cpiMedianOracle.reportExpirationTimeSec).to.be.equal(
    config.cpiOracleParams.reportExpirationTimeSec
  )
  expect(snapshot.diggOracles.cpiMedianOracle.providersSize).to.be.equal(
    BigNumber.from(1)
  )

  console.log(9)

  expect(snapshot.diggOracles.centralizedMarketOracle.owners).to.deep.equal([daoAgent])
  expect(snapshot.diggOracles.centralizedMarketOracle.threshold).to.be.equal(BigNumber.from(1))

  expect(snapshot.diggOracles.constantOracle.value).to.be.equal(ethers.utils.parseEther('1'))
  expect(snapshot.diggOracles.constantOracle.medianOracle).to.be.equal(
    badgerSystem.diggOracles.cpiMedianOracle.address
  )
}

const compareDAO = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.fakeDAO.daoAgent
}

const compareBadgerDistributionPools = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.fakeDAO.daoAgent

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
  const daoAgent = badgerSystem.fakeDAO.daoAgent
}

// TODO: When Mainnet, compare to real contracts
const compareStakingAssets = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.fakeDAO.daoAgent
}

const compareDaoTimelocks = (badgerSystem: BadgerSystem, snapshot: BadgerSnapshot, config: SystemConfig) => {
  const daoAgent = badgerSystem.fakeDAO.daoAgent

  expect(snapshot.daoTimelocks.badgerTimelock.beneficiary).to.be.equal(daoAgent)
  expect(snapshot.daoTimelocks.badgerTimelock.locked).to.be.equal(config.tokenLockParams.badgerLockAmount)
  expect(snapshot.daoTimelocks.badgerTimelock.releaseTime).to.be.equal(
    config.trancheStart.add(config.tokenLockParams.lockDuration)
  )
  expect(snapshot.daoTimelocks.badgerTimelock.token).to.be.equal(badgerSystem.fakeDAO.badgerToken.address)

  expect(snapshot.daoTimelocks.diggTimeLock.beneficiary).to.be.equal(daoAgent)
  expect(snapshot.daoTimelocks.diggTimeLock.locked).to.be.equal(config.tokenLockParams.diggLockAmount)
  expect(snapshot.daoTimelocks.diggTimeLock.releaseTime).to.be.equal(
    config.trancheStart.add(config.tokenLockParams.lockDuration)
  )
  expect(snapshot.daoTimelocks.diggTimeLock.token).to.be.equal(badgerSystem.diggCore.diggToken.address)
}
