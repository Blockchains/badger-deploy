const { hash: namehash } = require('eth-ens-namehash')

import Agent from '../../../dependency-artifacts/badger-dao/Agent.json'
import Vault from '../../../dependency-artifacts/badger-dao/Vault.json'
import Voting from '../../../dependency-artifacts/badger-dao/Voting.json'
import Survey from '../../../dependency-artifacts/badger-dao/Survey.json'
import Payroll from '../../../dependency-artifacts/badger-dao/Payroll.json'
import Finance from '../../../dependency-artifacts/badger-dao/Finance.json'
import TokenManager from '../../../dependency-artifacts/badger-dao/TokenManager.json'

export const APPS = [
  { name: 'agent', contractName: 'Agent', artifact: Agent },
  { name: 'vault', contractName: 'Vault', artifact: Vault },
  { name: 'voting', contractName: 'Voting', artifact: Voting },
  { name: 'survey', contractName: 'Survey', artifact: Survey },
  { name: 'payroll', contractName: 'Payroll', artifact: Payroll },
  { name: 'finance', contractName: 'Finance', artifact: Finance },
  { name: 'token-manager', contractName: 'TokenManager', artifact: TokenManager }
]

export const APP_IDS = APPS.reduce((ids, { name }) => {
  // @ts-ignore
  ids[name] = namehash(`${name}.aragonpm.eth`)
  return ids
}, {})