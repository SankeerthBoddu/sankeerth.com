// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BODDUFaucet
 * @dev Faucet contract for distributing BODDU tokens
 * @author Sankeerth Boddu (boddu.eth)
 * 
 * Features:
 * - Rate-limited token distribution
 * - Configurable drip amount and cooldown
 * - Emergency withdrawal for owner
 * - Track total distributed and claim history
 */
contract BODDUFaucet is Ownable, ReentrancyGuard {
    
    IERC20 public bodduToken;
    
    // Faucet configuration
    uint256 public dripAmount;        // Amount of tokens to drip per claim
    uint256 public cooldownTime;      // Time between claims (in seconds)
    
    // Tracking
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;
    uint256 public totalDistributed;
    address[] public claimers;
    
    // Events
    event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event FaucetRefilled(address indexed from, uint256 amount);
    event ConfigUpdated(uint256 newDripAmount, uint256 newCooldown);
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _tokenAddress Address of BODDU token contract
     * @param _dripAmount Amount of tokens per claim (with decimals)
     * @param _cooldownTime Cooldown period in seconds
     */
    constructor(
        address _tokenAddress,
        uint256 _dripAmount,
        uint256 _cooldownTime
    ) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Invalid token address");
        bodduToken = IERC20(_tokenAddress);
        dripAmount = _dripAmount;
        cooldownTime = _cooldownTime;
    }
    
    /**
     * @dev Claim tokens from faucet
     */
    function claim() external nonReentrant {
        require(canClaim(msg.sender), "Cooldown period not elapsed");
        require(bodduToken.balanceOf(address(this)) >= dripAmount, "Faucet empty");
        
        // Update claim tracking
        if (lastClaimTime[msg.sender] == 0) {
            claimers.push(msg.sender);
        }
        
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += dripAmount;
        totalDistributed += dripAmount;
        
        // Transfer tokens
        require(bodduToken.transfer(msg.sender, dripAmount), "Transfer failed");
        
        emit TokensClaimed(msg.sender, dripAmount, block.timestamp);
    }
    
    /**
     * @dev Check if address can claim
     * @param _address Address to check
     * @return bool True if can claim
     */
    function canClaim(address _address) public view returns (bool) {
        return block.timestamp >= lastClaimTime[_address] + cooldownTime;
    }
    
    /**
     * @dev Get time until next claim
     * @param _address Address to check
     * @return uint256 Seconds until next claim (0 if can claim now)
     */
    function timeUntilNextClaim(address _address) public view returns (uint256) {
        if (canClaim(_address)) {
            return 0;
        }
        return (lastClaimTime[_address] + cooldownTime) - block.timestamp;
    }
    
    /**
     * @dev Get faucet balance
     * @return uint256 Current token balance of faucet
     */
    function getFaucetBalance() public view returns (uint256) {
        return bodduToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get total number of unique claimers
     * @return uint256 Number of addresses that have claimed
     */
    function getTotalClaimers() public view returns (uint256) {
        return claimers.length;
    }
    
    /**
     * @dev Get leaderboard (top claimers)
     * @param _limit Number of top claimers to return
     * @return addresses Array of claimer addresses
     * @return amounts Array of total claimed amounts
     */
    function getLeaderboard(uint256 _limit) public view returns (address[] memory addresses, uint256[] memory amounts) {
        uint256 length = claimers.length > _limit ? _limit : claimers.length;
        addresses = new address[](length);
        amounts = new uint256[](length);
        
        // Simple selection (not sorted, for gas efficiency)
        // Front-end should sort
        for (uint256 i = 0; i < length; i++) {
            addresses[i] = claimers[i];
            amounts[i] = totalClaimed[claimers[i]];
        }
        
        return (addresses, amounts);
    }
    
    /**
     * @dev Owner can update faucet configuration
     * @param _newDripAmount New drip amount
     * @param _newCooldown New cooldown time
     */
    function updateConfig(uint256 _newDripAmount, uint256 _newCooldown) external onlyOwner {
        require(_newDripAmount > 0, "Drip amount must be positive");
        require(_newCooldown > 0, "Cooldown must be positive");
        
        dripAmount = _newDripAmount;
        cooldownTime = _newCooldown;
        
        emit ConfigUpdated(_newDripAmount, _newCooldown);
    }
    
    /**
     * @dev Emergency withdrawal by owner
     * @param _to Address to send tokens
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(bodduToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        
        require(bodduToken.transfer(_to, _amount), "Transfer failed");
        
        emit EmergencyWithdraw(_to, _amount);
    }
    
    /**
     * @dev Refill faucet (anyone can donate tokens)
     * Note: Caller must approve tokens first
     * @param _amount Amount to refill
     */
    function refill(uint256 _amount) external {
        require(_amount > 0, "Amount must be positive");
        require(bodduToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        emit FaucetRefilled(msg.sender, _amount);
    }
}
