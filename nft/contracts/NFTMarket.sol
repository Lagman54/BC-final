// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is Ownable {
    IERC721 public nftContract;

    struct NFTListingInfo {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => NFTListingInfo) public nftListings;

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId);
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NFTGifted(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Error: not the NFT owner");
        require(price > 0, "NFT price must be > 0");

        nftListings[tokenId] = NFTListingInfo({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        NFTListingInfo memory listing = nftListings[tokenId];

        require(listing.active, "NFT is not listed for sale");
        require(msg.value == listing.price, "Incorrect amount of ETH sent, please send the exact amount");

        nftListings[tokenId].active = false;

        (bool sent, ) = payable(listing.seller).call{value: msg.value}("");
        // bool sent = payable(listing.seller).send(msg.value);
        require(sent, "Payment failed");

        nftContract.safeTransferFrom(listing.seller, msg.sender, tokenId);
        emit NFTSold(tokenId, msg.sender, listing.price);
    }

    function giftNFT(uint256 tokenId, address recipient) external {
        require(recipient != address(0), "Invalid recipient address");
        require(nftContract.ownerOf(tokenId) == msg.sender, "You must own the NFT to gift it");
        require(recipient != msg.sender, "You cannot gift NFT to yourself");

        if (nftListings[tokenId].active) {
            nftListings[tokenId].active = false;
            emit NFTUnlisted(tokenId);
        }

        nftContract.safeTransferFrom(msg.sender, recipient, tokenId);
        emit NFTGifted(tokenId, msg.sender, recipient);
    }

    function unlistNFT(uint256 tokenId) external {
        NFTListingInfo memory listing = nftListings[tokenId];
        require(listing.seller == msg.sender, "You are not the owner of NFT");
        require(listing.active, "NFT is not listed");

        nftListings[tokenId].active = false;
        emit NFTUnlisted(tokenId);
    }
}
