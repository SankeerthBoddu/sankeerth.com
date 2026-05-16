// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BODDUToken
 * @dev Personal ERC-20 token representing BODDU brand
 * @author Sankeerth Boddu (boddu.eth)
 * 
 * Features:
 * - Fixed initial supply minted to deployer
 * - Burnable tokens for deflationary mechanism
 * - Owner can mint additional tokens if needed
 * - Connects to boddu.eth identity
 */
contract BODDUToken is ERC20, ERC20Burnable, Ownable {
    
    // Token metadata
    string private constant TOKEN_NAME = "BODDU Coin";
    string private constant TOKEN_SYMBOL = "BDU";
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev Constructor mints initial supply to deployer
     * @param initialSupply Number of tokens to mint (in base units, will be multiplied by 10^18)
     */
    constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) Ownable(msg.sender) {
        // Mint initial supply to deployer (converted to 18 decimals)
        _mint(msg.sender, initialSupply * 10 ** decimals());
        emit TokensMinted(msg.sender, initialSupply * 10 ** decimals());
    }
    
    /**
     * @dev Allows owner to mint additional tokens
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in base units with decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Override burn function to emit custom event
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Returns the number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
