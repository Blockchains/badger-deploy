rm -rf ./db
cp -r ./db-fresh ./db
ganache-cli --deterministic -e 1000 -l 0x86691b7 --db ./db