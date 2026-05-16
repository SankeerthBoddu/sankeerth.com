// Global variables
let provider;
let signer;
let tokenContract;
let faucetContract;
let userAddress;
let statsInterval;
let countdownInterval;

// Initialize the application
async function init() {
    console.log("Initializing BODDU Coin Faucet...");
    
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showAlert('Please install MetaMask to use this faucet', 'error');
        return;
    }
    
    // Check if already connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
        await connectWallet();
    }
}

// Connect wallet
async function connectWallet() {
    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Check network
        const network = await provider.getNetwork();
        if (network.chainId !== CONFIG.CHAIN_ID) {
            showAlert(`Please switch to ${CONFIG.NETWORK_NAME}`, 'error');
            return;
        }
        
        // Initialize contracts
        tokenContract = new ethers.Contract(CONFIG.TOKEN_ADDRESS, TOKEN_ABI, signer);
        faucetContract = new ethers.Contract(CONFIG.FAUCET_ADDRESS, FAUCET_ABI, signer);
        
        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('faucetSection').style.display = 'block';
        document.getElementById('walletAddress').textContent = formatAddress(userAddress);
        
        // Update contract addresses in UI
        document.getElementById('tokenContract').textContent = CONFIG.TOKEN_ADDRESS;
        document.getElementById('faucetContract').textContent = CONFIG.FAUCET_ADDRESS;
        
        // Load data
        await updateUserStats();
        await updateFaucetStats();
        await updateLeaderboard();
        await checkClaimStatus();
        
        // Start auto-refresh
        statsInterval = setInterval(async () => {
            await updateUserStats();
            await updateFaucetStats();
            await updateLeaderboard();
        }, CONFIG.STATS_REFRESH_INTERVAL);
        
        showAlert('Wallet connected successfully!', 'success');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showAlert('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        window.location.reload();
    } else if (accounts[0] !== userAddress) {
        // User switched accounts
        window.location.reload();
    }
}

// Update user statistics
async function updateUserStats() {
    try {
        const balance = await tokenContract.balanceOf(userAddress);
        const claimed = await faucetContract.totalClaimed(userAddress);
        
        document.getElementById('userBalance').textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(2);
        document.getElementById('totalClaimed').textContent = parseFloat(ethers.utils.formatEther(claimed)).toFixed(2);
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// Update faucet statistics
async function updateFaucetStats() {
    try {
        const faucetBalance = await faucetContract.getFaucetBalance();
        const dripAmount = await faucetContract.dripAmount();
        const totalDistributed = await faucetContract.totalDistributed();
        const totalClaimers = await faucetContract.getTotalClaimers();
        
        document.getElementById('faucetBalance').textContent = parseFloat(ethers.utils.formatEther(faucetBalance)).toFixed(2);
        document.getElementById('dripAmount').textContent = parseFloat(ethers.utils.formatEther(dripAmount)).toFixed(2);
        document.getElementById('totalDistributed').textContent = parseFloat(ethers.utils.formatEther(totalDistributed)).toFixed(2);
        document.getElementById('totalClaimers').textContent = totalClaimers.toString();
    } catch (error) {
        console.error('Error updating faucet stats:', error);
    }
}

// Update leaderboard
async function updateLeaderboard() {
    try {
        const [addresses, amounts] = await faucetContract.getLeaderboard(10);
        
        // Sort by amount (descending)
        const leaderboard = addresses.map((addr, i) => ({
            address: addr,
            amount: amounts[i]
        })).sort((a, b) => b.amount.gt(a.amount) ? 1 : -1);
        
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><span class="rank">#${index + 1}</span></td>
                <td>${formatAddress(entry.address)}</td>
                <td>${parseFloat(ethers.utils.formatEther(entry.amount)).toFixed(2)} BDU</td>
            `;
        });
        
        document.getElementById('leaderboardLoading').style.display = 'none';
        document.getElementById('leaderboardTable').style.display = 'table';
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

// Check if user can claim
async function checkClaimStatus() {
    try {
        const canClaim = await faucetContract.canClaim(userAddress);
        
        if (canClaim) {
            // User can claim
            document.getElementById('claimSection').style.display = 'block';
            document.getElementById('countdownSection').style.display = 'none';
            document.getElementById('claimButton').disabled = false;
        } else {
            // User must wait
            document.getElementById('claimSection').style.display = 'none';
            document.getElementById('countdownSection').style.display = 'block';
            startCountdown();
        }
    } catch (error) {
        console.error('Error checking claim status:', error);
    }
}

// Start countdown timer
async function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(async () => {
        try {
            const timeUntil = await faucetContract.timeUntilNextClaim(userAddress);
            
            if (timeUntil.eq(0)) {
                clearInterval(countdownInterval);
                await checkClaimStatus();
                return;
            }
            
            const seconds = timeUntil.toNumber();
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            document.getElementById('countdown').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error updating countdown:', error);
        }
    }, CONFIG.COUNTDOWN_REFRESH_INTERVAL);
}

// Claim tokens
async function claimTokens() {
    const button = document.getElementById('claimButton');
    button.disabled = true;
    button.textContent = 'Claiming...';
    
    try {
        showAlert('Sending transaction...', 'warning');
        
        const tx = await faucetContract.claim();
        showAlert('Transaction sent! Waiting for confirmation...', 'warning');
        
        await tx.wait();
        
        showAlert('Successfully claimed tokens! 🎉', 'success');
        
        // Update stats
        await updateUserStats();
        await updateFaucetStats();
        await checkClaimStatus();
        
    } catch (error) {
        console.error('Error claiming tokens:', error);
        
        let errorMessage = 'Failed to claim tokens';
        if (error.message.includes('Cooldown period not elapsed')) {
            errorMessage = 'You must wait before claiming again';
        } else if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction was rejected';
        }
        
        showAlert(errorMessage, 'error');
        button.disabled = false;
        button.textContent = '🎁 Claim Tokens';
    }
}

// Show alert message
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertBox.innerHTML = '';
        }, 5000);
    }
}

// Format address for display
function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Add token to MetaMask
async function addTokenToMetaMask() {
    try {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: CONFIG.TOKEN_ADDRESS,
                    symbol: CONFIG.TOKEN_SYMBOL,
                    decimals: CONFIG.TOKEN_DECIMALS,
                },
            },
        });
    } catch (error) {
        console.error('Error adding token to MetaMask:', error);
    }
}

// Initialize when page loads
window.addEventListener('load', init);
