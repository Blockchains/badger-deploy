import { task, usePlugin } from "@nomiclabs/buidler/config";
import dotenv from 'dotenv';
import waffle from "ethereum-waffle";

dotenv.config();
usePlugin("@nomiclabs/buidler-waffle");
usePlugin('buidler-gas-reporter');

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, bre) => {
  const accounts = await bre.ethers.getSigners(); 


  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

export default {
  defaultNetwork: "buidlerevm",
  networks: {
    buidlerevm: {
      chaindId: 31337,
      blockGasLimit: 12500000
    },
    ganache: {
      url: 'http://localhost:8545',
      gasLimit: 6000000000,
      db_path: '/db',
      network_id: 31337
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      accounts: {mnemonic: process.env.MNEMONIC}
    },
  },
  gasReporter: {
    currency: 'USD'
  },
  // mocha: { enableTimeouts: false }
};