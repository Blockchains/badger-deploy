import { deploySystem } from './deploySystem'
import { run, ethers } from '@nomiclabs/buidler'

async function main() {
  const jsonRpcProvider = ethers.provider
  const url = jsonRpcProvider.connection.url

  const [deployer] = await ethers.getSigners()
  await deploySystem(jsonRpcProvider, deployer)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
