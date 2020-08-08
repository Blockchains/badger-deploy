
import { run, ethers } from "@nomiclabs/buidler";
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import { RebaseSystem } from "./RebaseSystem";
import config from './config';

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Deploy Rebase Core (token, supply management, oracles)
  const rebase = new RebaseSystem();
  await rebase.deploySystem(config.ROPSTEN, deployer);

  // Confirm initial setup

  // Transfer to DAO
  await rebase.transferToSystemOwner();

  // Confirm ownership

  // Deploy liquidity pool
  await rebase.deployUniswapPool(deployer);

  // Distribute BASE and gBASE tokens to contributors

  // Deploy Geyser

  // Confirm Geyser setup

  // Lock gBASE in Geyser

  // Fund liquidity pool
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });