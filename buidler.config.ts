import { task, usePlugin } from "@nomiclabs/buidler/config";
import dotenv from 'dotenv';

dotenv.config();
usePlugin("@nomiclabs/buidler-waffle");

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
      blockGasLimit: 12500000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      accounts: {mnemonic: process.env.MNEMONIC}
    },
  },
};