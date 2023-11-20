// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 public constant MAX_MINT = 1000 ether;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mintOwner(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function mint(address to, uint256 amount) public {
        require(amount <= MAX_MINT, "ERC20: Max mint exceeded");
        _mint(to, amount);
    }
}
