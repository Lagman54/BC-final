// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract is ERC721Enumerable, Ownable {
    uint256 public tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("NFTContract", "NFTC") Ownable(msg.sender) {}

    function mintNFT(string memory uri) external returns (uint256) {
        tokenIdCounter += 1;
        uint256 newTokenId = tokenIdCounter;
        _safeMint(msg.sender, newTokenId);
        _tokenURIs[newTokenId] = uri;
        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Specified token does not exist");
        return _tokenURIs[tokenId];
    }

}
