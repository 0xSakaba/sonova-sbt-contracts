// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SonovaSBT
 * @dev An example of an open edition NFT contract for 2 weeks.
 */
contract SonovaSBT is ERC721Enumerable, Ownable {
    string private _baseTokenURI;

    constructor(
        string memory baseTokenURI
    )
        ERC721("Sonova - Ecosystem badge on Soneium", "SonovaSBT")
        Ownable(msg.sender)
    {
        _baseTokenURI = baseTokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _baseTokenURI;
    }

    /**
     * @dev owner can set the base URI
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        _baseTokenURI = _newBaseURI;
    }

    /**
     * @notice soulbound token, so no transfer is allowed
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        revert("This is a Soulbound Token and cannot be transferred");
    }

    /**
     * @notice soulbound token, so no transfer is allowed
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) {
        revert("This is a Soulbound Token and cannot be transferred");
    }

    function batchMint(address[] memory _addresses) external onlyOwner {
        uint256 i = _addresses.length;
        do {
            unchecked {
                i--;
            }
            _mint(_addresses[i], totalSupply() + 1);
        } while (i > 0);
    }
}
