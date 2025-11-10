// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAavePool
 * @dev Interface for Aave V3 Pool
 */
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    );
}

/**
 * @title IAToken
 * @dev Interface for Aave aTokens (interest bearing tokens)
 */
interface IAToken {
    function balanceOf(address user) external view returns (uint256);
    function scaledBalanceOf(address user) external view returns (uint256);
}

/**
 * @title EducationVault
 * @dev A vault that accepts USDC deposits, puts them into Aave for yield,
 * and sends all yield to an education fund address for manual distribution
 */
contract EducationVault is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    IAavePool public immutable aavePool;
    IAToken public immutable aUSDC; // Aave interest bearing USDC token
    address public educationFund;
    
    uint256 public totalDeposited;
    uint256 public totalYieldHarvested;
    
    mapping(address => uint256) public userDeposits;
    
    event Deposit(address indexed user, uint256 amount);
    event YieldHarvested(uint256 yieldAmount, uint256 timestamp);
    event TrainerPaid(address indexed trainer, uint256 amount);
    event EducationFundUpdated(address indexed newFund);
    
    constructor(
        address _usdc,
        address _aavePool,
        address _aUSDC,
        address _educationFund
    ) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        aavePool = IAavePool(_aavePool);
        aUSDC = IAToken(_aUSDC);
        educationFund = _educationFund;
    }
    
    /**
     * @dev Deposit USDC into the vault
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(msg.sender) >= amount, "Insufficient USDC balance");
        
        // Transfer USDC from user to this contract
        usdc.transferFrom(msg.sender, address(this), amount);
        
        // Update tracking
        userDeposits[msg.sender] += amount;
        totalDeposited += amount;
        
        // TODO: Deposit into Aave
        _depositToAave(amount);
        
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @dev Harvest yield from Aave and send to education fund
     */
    function harvestYield() external onlyOwner {
        // TODO: Implement Aave yield harvesting
        uint256 currentBalance = _getAaveBalance();
        uint256 yield = currentBalance > totalDeposited ? currentBalance - totalDeposited : 0;
        
        if (yield > 0) {
            // Withdraw yield from Aave
            _withdrawFromAave(yield);
            
            // Transfer yield to education fund
            usdc.transfer(educationFund, yield);
            
            totalYieldHarvested += yield;
            
            emit YieldHarvested(yield, block.timestamp);
        }
    }
    
    /**
     * @dev Admin function to pay trainers from education fund
     * @param trainer Address of the trainer to pay
     * @param amount Amount to pay
     */
    function payTrainer(address trainer, uint256 amount) external onlyOwner {
        require(trainer != address(0), "Invalid trainer address");
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(educationFund) >= amount, "Insufficient education fund balance");
        
        // This would require the education fund to approve this contract
        // For simplicity, we assume the owner has direct access to education fund
        usdc.transferFrom(educationFund, trainer, amount);
        
        emit TrainerPaid(trainer, amount);
    }
    
    /**
     * @dev Get total amount deposited
     */
    function getTotalDeposited() external view returns (uint256) {
        return totalDeposited;
    }
    
    /**
     * @dev Get total yield earned
     */
    function getYieldEarned() external view returns (uint256) {
        return totalYieldHarvested;
    }
    
    /**
     * @dev Get education fund balance
     */
    function getEducationFundBalance() external view returns (uint256) {
        return usdc.balanceOf(educationFund);
    }
    
    /**
     * @dev Update education fund address
     */
    function setEducationFund(address _educationFund) external onlyOwner {
        require(_educationFund != address(0), "Invalid address");
        educationFund = _educationFund;
        emit EducationFundUpdated(_educationFund);
    }
    
    /**
     * @dev Internal function to deposit USDC to Aave
     * @param amount Amount to deposit
     */
    function _depositToAave(uint256 amount) internal {
        // Approve Aave pool to spend USDC
        usdc.approve(aavePool, amount);
        
        // Call Aave supply function
        // IAavePool(aavePool).supply(address(usdc), amount, address(this), 0);
        
        // For demo purposes, we'll just hold the USDC here
        // In production, you'd integrate with Aave's supply function
    }
    
    /**
     * @dev Internal function to withdraw USDC from Aave
     * @param amount Amount to withdraw
     */
    function _withdrawFromAave(uint256 amount) internal {
        // Call Aave withdraw function
        // IAavePool(aavePool).withdraw(address(usdc), amount, address(this));
        
        // For demo purposes, we simulate having yield available
    }
    
    /**
     * @dev Internal function to get current Aave balance
     */
    function _getAaveBalance() internal view returns (uint256) {
        // In production, this would query the aToken balance
        // For demo, we simulate some yield generation
        return totalDeposited + (totalDeposited * 5 / 100); // Simulate 5% yield
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        usdc.transfer(owner(), balance);
    }
}