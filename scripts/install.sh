#!/usr/bin/env bash

# uFragments setup
yarn --cwd "deps/uFragments" && \
yarn compile --cwd "deps/uFragments" && \
# market-oracle setup
yarn --cwd "deps/market-oracle" && \
yarn compile --cwd "deps/market-oracle" && \
# token-geyser setup
yarn --cwd "deps/token-geyser" && \
yarn compile --cwd "deps/token-geyser" && \
# uniswap-v2-periphery setup
yarn --cwd "deps/uniswap-v2-periphery" && \
yarn compile --cwd "deps/uniswap-v2-periphery" && \
echo "Dependencies installed"
