import { utils } from 'ethers'
import rinkeby from './rinkeby.json';
import mainnet from './mainnet.json';

export interface RebaseDeployment {
  rebaseSystem: {
    baseToken: string
    baseTokenLogic: string
    supplyPolicy: string
    supplyPolicyLogic: string
    orchestrator: string
    daoAgent: string
    daoFinance: string
    proxyAdmin: string
    marketMedianOracle: string
    cpiMedianOracle: string
    constantOracle: string
    daoGovernanceToken: string
    tokenGeyser: string
    rebaseBtcBaseOracle: string
  }
  externalContracts: {
    uniswapPool: string
    uniswapV2Router: string
    uniswapV2Factory: string
    weth: string
    stakingTokenAddress?: string
  }
}

const getDeployedForNetwork = (network: string): RebaseDeployment => {
  switch (network) {
    case 'rinkeby':
      return rinkeby;
    default: 
    throw new Error ("Invalid network specified")
  }
}

export const getDeployed = (network: string): RebaseDeployment => {
  const config = getDeployedForNetwork(network);
  return {
    rebaseSystem: {
      baseToken: utils.getAddress(config.rebaseSystem.baseToken),
      baseTokenLogic: utils.getAddress(config.rebaseSystem.baseTokenLogic),
      supplyPolicy: utils.getAddress(config.rebaseSystem.supplyPolicy),
      supplyPolicyLogic: utils.getAddress(config.rebaseSystem.supplyPolicyLogic),
      orchestrator: utils.getAddress(config.rebaseSystem.orchestrator),
      marketMedianOracle: utils.getAddress(config.rebaseSystem.marketMedianOracle),
      cpiMedianOracle: utils.getAddress(config.rebaseSystem.cpiMedianOracle),
      constantOracle: utils.getAddress(config.rebaseSystem.constantOracle),
      proxyAdmin: utils.getAddress(config.rebaseSystem.proxyAdmin),
      daoAgent: utils.getAddress(config.rebaseSystem.daoAgent),
      daoFinance: utils.getAddress(config.rebaseSystem.daoFinance), // Aragon DAO Finance
      daoGovernanceToken: utils.getAddress(config.rebaseSystem.daoGovernanceToken), // Aragon DAO Governance Token
      tokenGeyser: utils.getAddress(config.rebaseSystem.tokenGeyser),
      rebaseBtcBaseOracle: utils.getAddress(config.rebaseSystem.rebaseBtcBaseOracle)
    },
    externalContracts: {
      uniswapPool: utils.getAddress(config.externalContracts.uniswapPool),
      uniswapV2Factory: utils.getAddress(config.externalContracts.uniswapV2Factory),
      uniswapV2Router: utils.getAddress(config.externalContracts.uniswapV2Router),
      weth: utils.getAddress(config.externalContracts.weth),
      stakingTokenAddress: utils.getAddress(config.externalContracts.uniswapPool)
    }
  }
}
