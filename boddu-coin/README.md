# BODDU Coin (BDU)

Personal ERC-20 token on Ethereum mainnet.

## Features

- ERC-20 token with burn functionality
- Public faucet with 24-hour cooldown
- Leaderboard tracking
- MetaMask integration

## Tech Stack

- Solidity 0.8.20 + OpenZeppelin
- Hardhat for development/testing
- Ethers.js for frontend

## Usage

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Contracts

- **BODDUToken.sol** - ERC-20 token contract
- **BODDUFaucet.sol** - Faucet with rate limiting

## Frontend

Static Web3 DApp in `/frontend` with wallet connection and claim functionality.

## Links

- Faucet: [sankeerth.com/boddu-coin](https://sankeerth.com/boddu-coin)
- ENS: boddu.eth
