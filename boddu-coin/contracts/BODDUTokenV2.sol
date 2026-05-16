// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BODDUTokenV2
 * @dev Enhanced ERC-20 token with public minting, supply cap, and mint fee
 * @author Sankeerth Boddu (boddu.eth)
 * 
 * Features:
 * - Fixed maximum supply (10 million tokens)
 * - Public minting with small ETH fee (respects cap)
 * - Owner can mint unlimited (bypasses cap)
 * - Per-address mint limit for public
 * - Owner can withdraw collected ETH
 * - Burnable tokens
 */
contract BODDUTokenV2 is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // Token configuration
    string private constant TOKEN_NAME = "BODDU Token";
    string private constant TOKEN_SYMBOL = "BDU";
    
    // Supply limits (for PUBLIC minting only - owner bypasses)
    uint256 public constant MAX_PUBLIC_SUPPLY = 1_000_000 * 10**18;   // 1 million tokens
    uint256 public constant MINT_AMOUNT = 1000 * 10**18;              // 1000 tokens per mint
    uint256 public constant MAX_MINTS_PER_ADDRESS = 10;               // Max 10 mints per wallet
    
    // Mint price (tiny fee)
    uint256 public mintPrice = 0.0001 ether;  // ~$0.25 at $2500 ETH
    
    // Tracking
    mapping(address => uint256) public mintCount;
    uint256 public totalMinters;
    uint256 public publicMintedSupply;  // Track public mints separately
    address[] public minters;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, uint256 paid);
    event OwnerMinted(address indexed to, uint256 amount);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event ETHWithdrawn(address indexed to, uint256 amount);
    
    /**
     * @dev Constructor - mints initial supply to owner
     * @param initialOwnerSupply Tokens to mint to owner (in whole tokens)
     */
    constructor(uint256 initialOwnerSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) Ownable(msg.sender) {
        // Owner can mint any amount - no cap check needed
        if (initialOwnerSupply > 0) {
            _mint(msg.sender, initialOwnerSupply * 10**18);
        }
    }
    
    /**
     * @dev Public mint function - anyone can mint by paying ETH
     * Subject to MAX_PUBLIC_SUPPLY cap
     */
    function mint() external payable nonReentrant {
        require(msg.value >= mintPrice, "Insufficient ETH sent");
        require(publicMintedSupply + MINT_AMOUNT <= MAX_PUBLIC_SUPPLY, "Public mint cap reached");
        require(mintCount[msg.sender] < MAX_MINTS_PER_ADDRESS, "Max mints reached for address");
        
        // Track minter
        if (mintCount[msg.sender] == 0) {
            minters.push(msg.sender);
            totalMinters++;
        }
        mintCount[msg.sender]++;
        publicMintedSupply += MINT_AMOUNT;
        
        // Mint tokens
        _mint(msg.sender, MINT_AMOUNT);
        
        // Refund excess ETH
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
        
        emit TokensMinted(msg.sender, MINT_AMOUNT, mintPrice);
    }
    
    /**
     * @dev Check how many mints remaining for an address
     */
    function mintsRemaining(address _address) external view returns (uint256) {
        return MAX_MINTS_PER_ADDRESS - mintCount[_address];
    }
    
    /**
     * @dev Check how many tokens can still be minted by public
     */
    function publicMintableSupply() external view returns (uint256) {
        return MAX_PUBLIC_SUPPLY - publicMintedSupply;
    }
    
    /**
     * @dev Owner can update mint price
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = _newPrice;
        emit MintPriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev Owner can withdraw collected ETH
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
        emit ETHWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Owner can mint unlimited tokens (no cap)
     * Use for: treasury, airdrops, liquidity, rewards
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit OwnerMinted(to, amount);
    }
    
    /**
     * @dev Owner can mint to multiple addresses at once
     */
    function ownerMintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit OwnerMinted(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Returns decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
