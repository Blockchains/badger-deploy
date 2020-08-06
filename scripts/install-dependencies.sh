#!/usr/bin/env bash

# uFragments setup
npm install --prefix "dependencies/uFragments" && \
# market-oracle setup
npm install --prefix "dependencies/market-oracle" && \
# token-geyser setup
npm install --prefix "dependencies/token-geyser" && \
# uniswap-v2-periphery setup
yarn --cwd "dependencies/uniswap-v2-periphery" && \
# uniswap-v2-core setup
yarn --cwd "dependencies/uniswap-v2-core" && \
echo "Dependencies installed"
