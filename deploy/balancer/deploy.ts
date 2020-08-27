import { ethers } from 'ethers'
import { deployContract } from 'ethereum-waffle'
import { Contract, Signer, BigNumber, utils } from 'ethers'
import * as _ from 'lodash'

// OZ SDK
import Web3 from 'web3'
import { Contracts, ProxyAdminProject, ZWeb3 } from '@openzeppelin/upgrades'

import BPool from '../../dependency-artifacts/balancer-core/BPool.json'
import IERC20 from '../../dependency-artifacts/rebase-oracle/IERC20.json'

export interface Bind {
    address: string,
    amount: BigNumber,
    denorm: BigNumber
}

export const deployAndConfigBalancerPool = async (deployer: Signer): Promise<Contract> => {
    //, assets: Bind[]
    const pool = await deployContract(deployer, BPool, undefined, {gasLimit: 9999999});

    // for (const asset of assets) {
    //     const assetContract = new Contract(asset.address, IERC20.abi, deployer);
    //     let tx = await assetContract.approve(pool.address, ethers.constants.MaxUint256);
    //     await tx.wait()

    //     tx = await pool.bind(asset.address, asset.amount, asset.denorm);
    //     await tx.wait()
    // }
    return pool
}
