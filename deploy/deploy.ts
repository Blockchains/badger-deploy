
import { run, ethers } from "@nomiclabs/buidler";
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';

// Rebase Core
import UFragments from '../dependencies/uFragments/build/contracts/UFragments.json';
import UFragmentsPolicy from '../dependencies/uFragments/build/contracts/UFragmentsPolicy.json';
import Orchestrator from '../dependencies/uFragments/build/contracts/Orchestrator.json';

// Oracles
import MedianOracle from '../dependencies/market-oracle/build/contracts/MedianOracle.json';
import ExampleOracleSimple from '../dependencies/uniswap-v2-periphery/build/ExampleOracleSimple.json';
// import ConstantOracle from '../dependencies/rebase-oracles/build/contracts/ConstantOracle.json';
// import OracleBridge from '../dependencies/rebase-oracles/build/contracts/OracleBridge.json';

// Liquidity
import UniswapV2Pair from '../dependencies/uniswap-v2-core/build/UniswapV2Pair.json';
import UniswapV2Factory from '../dependencies/uniswap-v2-core/build/UniswapV2Factory.json';
import UniswapV2ERC20 from '../dependencies/uniswap-v2-core/build/UniswapV2ERC20.json';

async function main() {
  await run("compile");
  const accounts = await ethers.getSigners();
  const signer = accounts[0];

  const contracts = await Promise.all([
    deployContract(signer, UFragments), 
    deployContract(signer, UFragmentsPolicy),
  ]);

  const [uFragments, uFragmentsPolicy] = contracts;

  console.log(uFragments.address);
  const supply = await uFragments.totalSupply();
  console.log(supply);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

  /*
    Deploy BASE Token [Proxy + Logic]
*/

/*
    Deploy SupplyPolicy [Proxy + Logic]
*/

/*
    Deploy Orchestrator
*/

/* 
    Deploy 'Always 1' CPI oracle
*/

/* 
    Deploy Uniswap BASE/ETH Oracle
*/

/* 
    (Test) Deploy BTC/ETH Oracle
    (Prod) Use BTC/ETH Oracle Address
*/

/*
    Deploy market oracle bridge
*/

/*
    (Test) Deploy Uniswap system + pool
    (Prod) Create pool on Uniswap
*/

/*
    Initialize BASE Token, Supply Policy, Orchestrator
*/

/*
    Initialize Oracles
*/
