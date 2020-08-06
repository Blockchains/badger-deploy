import { ethers } from "@nomiclabs/buidler";
import { Contract } from "ethers";

export class RebaseSystem {
    // Token
    baseToken: Contract;
    baseTokenLogic: Contract;
    supplyPolicy: Contract;
    supplyPolicyLogic: Contract;
    Orchestrator: Contract;

    // Admin
    systemOwner: Contract;
    proxyAdmin: Contract;

    // Oracles
    marketMedianOracle: Contract;
    cpiMedianOracle: Contract;
    always1Oracle: Contract;
    uniswapPoolOracle: Contract;
    btcEthOracle: Contract;

    // Uniswap
    uniswapPool: Contract;
    uniswapRouter: Contract;
    uniswapFactory: Contract;
}

const config = {
    systemOwner: "0xa",
    rebase: 'Initial rebase params will go here',
}