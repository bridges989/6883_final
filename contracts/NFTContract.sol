// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTMarketplace is ERC1155, Ownable, ReentrancyGuard {
    using Address for address payable;

    uint256 private _tokenIds;

    struct NFT {
        string name;
        string description;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFT) public nfts;
    mapping(uint256 => address) public nftCreators;

    event NFTCreated(uint256 tokenId, string name, string description, uint256 price);
    event NFTListed(uint256 tokenId, uint256 price);
    event NFTUnlisted(uint256 tokenId);
    event NFTPurchased(uint256 tokenId, address buyer, uint256 price);

    //"https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json"
    constructor() ERC1155("") {
        // _mint(msg.sender, 1, 1, "");
        // _mint(msg.sender, 2, 1, "");
    }

    function createNFT(string memory name, string memory description, string memory tokenURI) public {
        _tokenIds += 1;
        uint256 tokenId = _tokenIds;

        _mint(msg.sender, tokenId, 1, "");
        _setURI(tokenId, tokenURI);

        nfts[tokenId] = NFT(name, description, 0, false);
        nftCreators[tokenId] = msg.sender;

        emit NFTCreated(tokenId, name, description, 0);
    }

    function transferNFT(address to, uint256 tokenId) public {
        require(msg.sender == nftCreators[tokenId], "Only the creator can transfer the NFT.");
        safeTransferFrom(msg.sender, to, tokenId, 1, "");
        nftCreators[tokenId] = to;
    }

    function listNFTForSale(uint256 tokenId, uint256 price) public {
        require(nftCreators[tokenId] == msg.sender, "Only the creator can list the NFT for sale.");

        nfts[tokenId].price = price;
        nfts[tokenId].forSale = true;

        emit NFTListed(tokenId, price);
    }

    function removeNFTFromSale(uint256 tokenId) public {
        require(nftCreators[tokenId] == msg.sender, "Only the creator can remove the NFT from sale.");

        nfts[tokenId].forSale = false;

        emit NFTUnlisted(tokenId);
    }

    function purchaseNFT(uint256 tokenId) public payable nonReentrant {
        require(nfts[tokenId].forSale, "This NFT is not for sale");
        require(msg.value >= nfts[tokenId].price, "Insufficient funds to purchase this NFT");

        address seller = nftCreators[tokenId];
        require(seller != msg.sender, "You already own this NFT.");

        safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        nfts[tokenId].forSale = false;

        address payable buyer = payable(seller);
        buyer.sendValue(msg.value);

        emit NFTPurchased(tokenId, msg.sender, nfts[tokenId].price);
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        _mint(msg.sender, tokenId, 1, abi.encodePacked(tokenURI));
    }

    // function uri(uint256 tokenId) override public pure returns (string memory) {
    //     return string(
    //         abi.encodePacked(
    //             "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/",
    //             Strings.toString(tokenId),".json"
    //         )
    //     );
    // }

    function printNFTsName(uint256 tokenId) view public returns (string memory){
        require(nftCreators[tokenId] == msg.sender, "Only the creator can read the NFTs");

        return nfts[tokenId].name;
    }

    function printNFTsDescription(uint256 tokenId) view public returns (string memory){
        require(nftCreators[tokenId] == msg.sender, "Only the creator can read the NFTs");

        return nfts[tokenId].description;
    }
}