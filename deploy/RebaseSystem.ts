import { run, ethers } from "@nomiclabs/buidler";
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import { Contract, Signer } from "ethers";
import { RebaseConfig } from "./config";

// Rebase Core
import UFragments from '../dependencies/uFragments/build/contracts/UFragments.json';
import UFragmentsPolicy from '../dependencies/uFragments/build/contracts/UFragmentsPolicy.json';
import Orchestrator from '../dependencies/uFragments/build/contracts/Orchestrator.json';

// Oracles
import MedianOracle from '../dependencies/market-oracle/build/contracts/MedianOracle.json';
import ExampleOracleSimple from '../dependencies/uniswap-v2-periphery/build/ExampleOracleSimple.json';
import ConstantOracle from '../dependencies/rebase-oracle/artifacts/ConstantOracle.json';
import RebaseOracleBridge from '../dependencies/rebase-oracle/artifacts/RebaseOracleBridge.json';
import AggregatorInterface from '../dependencies/rebase-oracle/artifacts/AggregatorInterface.json';
import IERC20 from '../dependencies/rebase-oracle/artifacts/IERC20.json';

// Liquidity
import UniswapV2Pair from '../dependencies/uniswap-v2-core/build/UniswapV2Pair.json';
import UniswapV2Factory from '../dependencies/uniswap-v2-core/build/UniswapV2Factory.json';
import UniswapV2Router02 from '../dependencies/uniswap-v2-periphery/build/UniswapV2Router02.json';
import UniswapV2ERC20 from '../dependencies/uniswap-v2-core/build/UniswapV2ERC20.json';

export class RebaseSystem {
    // Rebase Core
    baseToken!: Contract;
    baseTokenLogic!: Contract;
    supplyPolicy!: Contract;
    supplyPolicyLogic!: Contract;
    orchestrator!: Contract;

    // Admin
    systemOwner!: string;
    proxyAdmin!: Contract;

    // Oracles
    marketMedianOracle!: Contract;
    cpiMedianOracle!: Contract;
    constantOracle!: Contract;
    uniswapPoolOracle!: Contract;
    chainlinkBtcEthOracle!: Contract;
    rebaseEthBaseOracle!: Contract;

    // Uniswap
    uniswapPool!: Contract;
    uniswapV2Router!: Contract;
    uniswapV2Factory!: Contract;

    // External Tokens
    weth!: Contract;
    dai!: Contract;

    async deploySystem(config: RebaseConfig, deployer: Signer) {
        const { externalContracts, rebaseParams, marketOracleParams, cpiOracleParams } = config;

        const deployerAddress = deployer.getAddress();

        this.systemOwner = externalContracts.systemOwner;

        this.uniswapV2Router = new Contract(externalContracts.uniswapV2Router, UniswapV2Router02.abi, deployer);
        this.uniswapV2Factory = new Contract(externalContracts.uniswapV2Factory, UniswapV2Factory.abi, deployer);
        this.weth = new Contract(externalContracts.weth, IERC20.abi, deployer);
        this.dai = new Contract(externalContracts.dai, IERC20.abi, deployer);

        this.baseToken = await deployContract(deployer, UFragments);
        this.supplyPolicy = await deployContract(deployer, UFragmentsPolicy);
        this.orchestrator = await deployContract(deployer, Orchestrator, [this.supplyPolicy.address]);

        this.marketMedianOracle = await deployContract(deployer, MedianOracle,
            [marketOracleParams.reportExpirationTimeSec,
            marketOracleParams.reportDelaySec,
            marketOracleParams.minimumProviders]);
        this.cpiMedianOracle = await deployContract(deployer, MedianOracle,
            [cpiOracleParams.reportExpirationTimeSec,
            cpiOracleParams.reportDelaySec,
            cpiOracleParams.minimumProviders]);

        this.constantOracle = await deployContract(deployer, ConstantOracle, [rebaseParams.baseCpi, this.cpiMedianOracle.address]);

        //     const ethBasePairAddress = await this.uniswapV2Factory.createPair(this.weth.address, this.baseToken.address);
        //     this.uniswapPool = new Contract(ethBasePairAddress, UniswapV2Pair.abi, deployer);

        // this.uniswapPoolOracle = await deployContract(deployer, ExampleOracleSimple, [
        //     this.uniswapV2Factory.address, this.weth.address, this.dai.address
        // ]);

        this.chainlinkBtcEthOracle = new Contract(externalContracts.chainlinkBtcEth, AggregatorInterface.abi, deployer);

        // this.rebaseEthBaseOracle = await deployContract(deployer, RebaseOracleBridge, [
        //     this.uniswapPoolOracle.address,
        //     this.chainlinkBtcEthOracle.address,
        //     this.marketMedianOracle.address,
        //     this.baseToken.address
        // ])

        // Sends full initial supply to systemOwner in initialize();
        this.baseToken.functions['initialize(address)'](this.systemOwner); // TODO: Name, symbol, decimals are hardcoded
        this.baseToken.setMonetaryPolicy(this.supplyPolicy.address);
        this.supplyPolicy.functions['initialize(address,address,uint256)'](deployerAddress, this.baseToken.address, rebaseParams.baseCpi);

        // The DAO will need to set all of these, unless an initial owner is set for deployment which initializes all parameters and then transfers functionality to the DAO
        this.supplyPolicy.setCpiOracle(this.cpiMedianOracle.address);
        this.supplyPolicy.setMarketOracle(this.marketMedianOracle.address);
        this.supplyPolicy.setDeviationThreshold(rebaseParams.deviationThreshold);
        this.supplyPolicy.setOrchestrator(this.orchestrator.address);
        this.supplyPolicy.setRebaseLag(rebaseParams.rebaseLag);
        this.supplyPolicy.setRebaseTimingParameters(rebaseParams.minRebaseTimeIntervalSec, rebaseParams.rebaseWindowOffsetSec, rebaseParams.rebaseWindowLengthSec);
        this.cpiMedianOracle.addProvider(this.constantOracle.address);
        // this.marketMedianOracle.addProvider(this.rebaseEthBaseOracle.address);
    }

    // Transfer Ownership of all contracts to system owner
    async transferToSystemOwner() {
        this.baseToken.transferOwnership(this.systemOwner);
        this.supplyPolicy.transferOwnership(this.systemOwner);
        this.orchestrator.transferOwnership(this.systemOwner);
        this.cpiMedianOracle.transferOwnership(this.systemOwner);
        this.marketMedianOracle.transferOwnership(this.systemOwner);
    }

    async deployUniswapPool(deployer: Signer) {
        const ethBasePairAddress = await this.uniswapV2Factory.createPair(this.weth.address, this.baseToken.address);
        this.uniswapPool = new Contract(ethBasePairAddress, UniswapV2Pair.abi, deployer);
    }
}