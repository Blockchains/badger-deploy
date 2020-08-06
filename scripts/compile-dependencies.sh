#!/usr/bin/env bash

# uFragments
npx truffle compile --prefix "dependencies/uFragments" && \
# market-oracle
npx truffle compile --prefix "dependencies/market-oracle" && \
# token-geyser
./scripts/compile-contracts.sh --prefix "dependencies/token-geyser" && \
# uniswap-v2-periphery setup
yarn compile --cwd "dependencies/uniswap-v2-periphery" && \
# uniswap-v2-core setup
yarn compile --cwd "dependencies/uniswap-v2-core" && \
echo "Dependency contracts compiled"
