# Badger Deployer
A set of scripts to deploy & test the Badger protocol. A more detailed overview of the deploy process can be found at the [Badger Docs](https://github.com/Badger-Finance/badger-docs/blob/master/Deploy.md) repo.


## Installation

1. Clone

    ```
    git clone https://github.com/Badger-Finance/badger-deploy
    ```
    ___

2. Install dependencies

    ```
    npm install
    ```
    ___

3. Setup environment

    ```
    cp .env.example .env
    ```

    Input values for _Mnemonic_ and _Infura API key_ in .env to connect to live testnets or mainnet
    ___
4. Run Scripts

    **Deploy (local):** Create a local instance of the Badger system using the parmeters specified in `deploy/badgerConfig.ts`. The initial parameters will be confirmed after deploy.

    ```
    npm run deploy-local
    ```

    (See `package.json` for other network variants)
    ___
    **Integration Test:**
    Test the operation of a local system, including inital deploy, token distribution, normal update operations of the system, and governance mechanics

    ```
    npm run test
    ```
    ___

## A note on dependencies
Because of the myriad sets of dependencies (node versions, compilers, etc) required to compile smart contract components used from other systems, the artifacts are pre-compiled and bundled under the `dependency-artifacts` folder.

Managing the various environment setups, installation, compilation, and storing of artifacts may be automated in the future to improve the experience of deployers who wish to confirm the veracity of all artifact files independently.

The source code for all artifacts can be found in the following repos:

- [Badger DAO Template](https://github.com/Badger-Finance/badger-dao) @latest
    - [Based on Aragon DAO Templates](https://github.com/aragon/dao-templates) @3e1c3a5
- [Badger Geyser](https://github.com/Badger-Finance/badger-geyser) @latest
- [Badger SmartTimelock](https://github.com/Badger-Finance/badger-timelock) @latest
- [Digg Core](https://github.com/Badger-Finance/digg-core) @latest
- [Digg Oracles](https://github.com/Badger-Finance/digg-oracles) @latest

- [Gnosis Safe](https://github.com/gnosis/safe-contracts) @94f9b90
- [Balancer Core](https://github.com/balancer-labs/balancer-core) @f4ed5d6
- [Uniswap-v2-Core](https://github.com/Uniswap/uniswap-v2-core) @4dd5906
- [Uniswap-v2-Periphery](https://github.com/Uniswap/uniswap-v2-periphery/) @4123f93
- [Openzeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) @cb791a1
