# Rebase Contracts

## Installation

1. Clone

`git clone https://github.com/Rebase-Finance/rebase-contracts.git`

2. Switch to old node version (see installation notes)

3. Install dependencies

`cd rebase-contracts`
`./scripts/clone-submodules.sh`
`./scripts/install-dependencies.sh`

4. Return to earlier node version

5. Compile dependency contracts
`./scripts/compile-dependencies.sh`

## Other Scripts

### Test dependencies
Run tests for the dependency repos
`./scripts/test-dependencies.sh`

## Installation Notes
Unfortunatly some of the old libraries used by token-geyser & market-oracle can only be built using old versions of node (more specifically, node-gyp). Downgrading node to version `8.1.1` temporarily will allow these dependencies to be built.