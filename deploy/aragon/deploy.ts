import { run, ethers } from '@nomiclabs/buidler'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { Contract, Signer, providers, BigNumber, utils, EventFilter } from 'ethers'
import fs from 'fs'
const { hash: namehash } = require('eth-ens-namehash')
import {TemplateDeployer} from './TemplateDeployer' 

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

let template: Contract;

export const deployAragonInfrastructure = async (deployer: Signer) => {
  const templateDeployer = new TemplateDeployer(deployer)
  template = await templateDeployer.deploy()
}

export const deployBadgerDAO = async (deployer: Signer, params: DAOParams) => {
  console.log(template.functions)
  await (await template.newTokenAndInstance(
    params.tokenName,
    params.tokenSymbol,
    params.id,
    params.holders,
    params.stakes,
    params.votingSettings,
    params.financePeriod,
    params.useAgentAsVault
  )).wait()

  const daoEvents = await template.queryFilter(template.filters.DeployDao())
  const tokenEvents = await template.queryFilter(template.filters.DeployToken())
  const appEvents = await template.queryFilter(template.filters.InstalledApp())

  console.warn(daoEvents, tokenEvents, appEvents);
}
