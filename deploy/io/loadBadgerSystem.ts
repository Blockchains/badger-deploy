
//   loadFromFile(path: string, deployer: Signer) {
//     const json = fs.readFileSync(path)
//      const snapshot = JSON.parse(json) as FormattedSnapshot
 
//      this.diggCore = {
//        diggToken: new Contract(snapshot.diggCore.diggToken.address, UniswapV2Pair.abi, deployer),
//        // diggTokenLogic: new Contract(snapshot.diggCore.diggTokenLogic.address, UniswapV2Pair.abi, deployer),
//        supplyPolicy: new Contract(snapshot.diggCore.supplyPolicy.address, UniswapV2Pair.abi, deployer),
//        // supplyPolicyLogic: new Contract(snapshot.diggCore.supplyPolicyLogic.address, UniswapV2Pair.abi, deployer),
//        orchestrator: new Contract(snapshot.diggCore.orchestrator.address, UniswapV2Pair.abi, deployer)
//      }
 
//      this.diggOracles = {
//        marketMedianOracle: new Contract(snapshot.diggOracles.marketMedianOracle.address, UniswapV2Pair.abi, deployer),
//        cpiMedianOracle: new Contract(snapshot.diggOracles.cpiMedianOracle.address, UniswapV2Pair.abi, deployer),
//        constantOracle: new Contract(snapshot.diggOracles.constantOracle.address, UniswapV2Pair.abi, deployer),
//        centralizedMarketOracle: new Contract(snapshot.diggOracles.centralizedMarketOracle.address, UniswapV2Pair.abi, deployer)
//      }
 
//      this.badgerDAO = {
//        daoAgent:snapshot.badgerDAO.agent.address,
//        daoFinance: snapshot.badgerDAO.finance.address,
//        agent: new Contract(snapshot.badgerDAO.agent.address, Agent.abi, deployer),
//        finance: new Contract(snapshot.badgerDAO.finance.address, Finance.abi, deployer),
//        proxyAdmin: new Contract(snapshot.badgerDAO.proxyAdmin.address, ProxyAdmin.abi, deployer),
//        kernel: new Contract(snapshot.badgerDAO.kernel.address, Kernel.abi, deployer),
//        voting: new Contract(snapshot.badgerDAO.voting.address, Voting.abi, deployer),
//        tokenManager: new Contract(snapshot.badgerDAO.tokenManager.address, TokenManager.abi, deployer),
//        badgerToken: new Contract(snapshot.badgerDAO.badgerToken.address, MiniMeToken.abi, deployer)
//      }
 
//      this.uniswapCore = {
//        uniswapV2Factory: new Contract(snapshot.uniswapCore.uniswapV2Factory.address, UniswapV2Factory.abi, deployer),
//        uniswapV2Router: new Contract(snapshot.uniswapCore.uniswapV2Router.address, UniswapV2Router.abi, deployer),
//      }
 
//      this.uniswapPools = {
//        badgerEthPool: new Contract(snapshot.uniswapPools.badgerEthPool.address, UniswapV2Pair.abi, deployer),
//        diggEthPool: new Contract(snapshot.uniswapPools.diggEthPool.address, UniswapV2Pair.abi, deployer),
//      }
 
//      this.balancerPools = {
//        badgerEthPool: new Contract(snapshot.balancerPools.badgerEthPool.address, BPool.abi, deployer),
//        diggEthPool: new Contract(snapshot.balancerPools.diggEthPool.address, BPool.abi, deployer),
//      }
 
//      this.weth = new Contract(snapshot.weth.address, WETH9.abi, deployer),
 
//      // this.badgerDistributionPools = {
//      //   tranches: []
//      // }
 
//      // for (const trancheSnapshot of snapshot.badgerDistributionPools) {
//      //   this.badgerDistributionPools.tranches.push(loadTranche(trancheSnapshot))
//      // }
 
//      // this.diggDistributionPools = {
//      //   tranches: []
//      // }
 
//      // for (const trancheSnapshot of snapshot.diggDistributionPools) {
//      //   this.diggDistributionPools.tranches.push(loadTranche(trancheSnapshot))
//      // }
 
//      // this.stakingAssets = {}
//      // for (const stakingAssetSnapshot of snapshot.stakingAssets) {
//      //   stakingAssets[stakingAsset.asset] = loadStakingAsset(stakingAssetSnapshot)
//      // }
  
//      // this.stakingAssets = {}
 
//      // this.daoTimelocks = {
//      //   badgerTimelock: new Contract(snapshot.daoTimelocks.badgerTimelock.address, TimeLock.abi, deployer),
//      //   diggTimelock: new Contract(snapshot.daoTimelocks.diggTimelock.address, TimeLock.abi, deployer)
//      // }
 
//      // config: 
//      // web3: 
//      // deployer: 
//      // deployerAddress!: 
//    }
//  }
 
//    // export function loadTranche(trancheSnapshot: fTrancheSnapshot): Tranche {
//    //     const tranche: Tranche = {
//    //       id: trancheSnapshot.id,
//    //       startTimeOffset: BigNumber.from(trancheSnapshot.startTimeOffset),
//    //       totalAmount: BigNumber.from(trancheSnapshot.totalAmount),
//    //       duration: BigNumber.from(trancheSnapshot.duration),
//    //       pools: [],
//    //     }
 
//    //     const pools = []
 
//    //     // for (const poolSnapshot in trancheSnapshot.pools) {
//    //     //   const pool: Pool = {
//    //     //     asset: poolSnapshot.asset,
//    //     //     contract: poolSnapshot.contract,
//    //     //     rewardMultiplier?: poolSnapshot.rewardMultiplier ? BigNumber.from(poolSnapshot.rewardMultiplier) : undefined,
//    //     //     special?: poolSnapshot.special ? poolSnapshot.special : undefined
//    //     //   }
//    //     //     pools.push(pool)
//    //     // }
 
//    //     tranche.pools = pools;
//    // return tranche;
//    //   }