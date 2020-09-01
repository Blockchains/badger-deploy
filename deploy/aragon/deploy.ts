import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { Contract, Signer, providers, BigNumber, utils, EventFilter } from 'ethers'
import fs from 'fs'
const { hash: namehash } = require('eth-ens-namehash')
import { TemplateDeployer } from './TemplateDeployer'
import {APP_IDS, APPS} from './infrastructure/apps'

// Badger DAO

export interface DAOParams {
  tokenName: string
  tokenSymbol: string
  id: string
  holders: string[]
  stakes: BigNumber[]
  votingSettings: BigNumber[]
  financePeriod: BigNumber
  useAgentAsVault: boolean
}

export interface BadgerDAO {
  dao: Contract
  token: Contract
  agent: Contract
  finance: Contract
}

let template: Contract

import Agent from '../../dependency-artifacts/badger-dao/Agent.json'
import Finance from '../../dependency-artifacts/badger-dao/Finance.json'
import Kernel from '../../dependency-artifacts/badger-dao/Kernel.json'
import IERC20 from '../../dependency-artifacts/digg-core/IERC20.json'

export const deployAragonInfrastructure = async (deployer: Signer) => {
  const templateDeployer = new TemplateDeployer(deployer)
  template = await templateDeployer.deploy()
}

export const deployBadgerDAO = async (deployer: Signer, params: DAOParams): Promise<BadgerDAO> => {
  console.log(template.functions)
  await (
    await template.newTokenAndInstance(
      params.tokenName,
      params.tokenSymbol,
      params.id,
      params.holders,
      params.stakes,
      params.votingSettings,
      params.financePeriod,
      params.useAgentAsVault
    )
  ).wait()

  const daoEvents = await template.queryFilter(template.filters.DeployDao())
  const tokenEvents = await template.queryFilter(template.filters.DeployToken())
  const appEvents = await template.queryFilter(template.filters.InstalledApp())

  console.warn(daoEvents, tokenEvents, appEvents)

  const daoAddress = daoEvents[0].args?.dao
  const tokenAddress = tokenEvents[0].args?.token

  const dao = new Contract(daoAddress, Kernel.abi, deployer)
  const token = new Contract(tokenAddress, IERC20.abi, deployer)

  let agent: Contract = new Contract(ethers.constants.AddressZero, Agent.abi, deployer)
  let finance: Contract = new Contract(ethers.constants.AddressZero, Finance.abi, deployer)

  for (const event of appEvents) {
    const appId = event.args?.appId
    const appProxy = event.args?.appProxy

    // @ts-ignore
    const appName = APP_IDS[appId]

    console.log(appName)

    if (appName === 'agent') {
      agent = new Contract(appProxy, Agent.abi, deployer)
    } else if (appName === 'finance') {
      finance = new Contract(appProxy, Finance.abi, deployer)
    }
  }

  if (!agent || !finance) {
    throw new Error (`Apps not found`)
  }

  return {
    dao,
    token,
    agent,
    finance
  }
}
