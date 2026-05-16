// Configuration file for BODDU Coin Faucet
// Update these addresses after deploying contracts

const CONFIG = {
    // Contract addresses - Deploy contracts and update these values
    // See DEPLOYMENT.md for deployment instructions
    TOKEN_ADDRESS: "YOUR_DEPLOYED_TOKEN_ADDRESS_HERE", // BODDUToken contract address
    FAUCET_ADDRESS: "YOUR_DEPLOYED_FAUCET_ADDRESS_HERE", // BODDUFaucet contract address
    
    // Network configuration
    CHAIN_ID: 1, // 1 = Mainnet, 11155111 = Sepolia testnet
    NETWORK_NAME: "Ethereum Mainnet",
    
    // Token details
    TOKEN_NAME: "BODDU Coin",
    TOKEN_SYMBOL: "BDU",
    TOKEN_DECIMALS: 18,
    
    // Explorer URLs
    ETHERSCAN_URL: "https://etherscan.io",
    
    // Refresh intervals (in milliseconds)
    STATS_REFRESH_INTERVAL: 30000, // 30 seconds
    COUNTDOWN_REFRESH_INTERVAL: 1000, // 1 second
};

// Contract ABIs
const TOKEN_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const FAUCET_ABI = [
    "function claim() external",
    "function canClaim(address) view returns (bool)",
    "function timeUntilNextClaim(address) view returns (uint256)",
    "function dripAmount() view returns (uint256)",
    "function cooldownTime() view returns (uint256)",
    "function lastClaimTime(address) view returns (uint256)",
    "function totalClaimed(address) view returns (uint256)",
    "function getFaucetBalance() view returns (uint256)",
    "function getTotalClaimers() view returns (uint256)",
    "function totalDistributed() view returns (uint256)",
    "function getLeaderboard(uint256) view returns (address[], uint256[])",
    "event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp)"
];
