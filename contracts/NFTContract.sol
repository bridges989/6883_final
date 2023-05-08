// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// The contract is built on top of ERC1155 standard
contract NFTMarketplace is ERC1155, Ownable, ReentrancyGuard {
    using Address for address payable;

    uint256 private _tokenIds;
    
    // create basic structure of NFT
    struct NFT {
        string name;
        string description;
        uint256 price;
        bool forSale;
    }
    
    // define a public mapping nfts that associates tokenID with the corresponding NFT
    mapping(uint256 => NFT) public nfts;
    // define a public mapping nftCreators that associates tokenID with the address of its creator
    mapping(uint256 => address) public nftCreators;
    
    // declare events that can be emitted by the contract when specific actions occur
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
        // generate a unique ID for the new NFT
        _tokenIds += 1;
        uint256 tokenId = _tokenIds;
        
        // mint a new token and assign it to the address of the sender
        _mint(msg.sender, tokenId, 1, "");
        
        // associate tokenURI with the new token
        _setURI(tokenId, tokenURI);
        
        // store the new NFT structure in nfts mapping using tokenId as the key
        nfts[tokenId] = NFT(name, description, 0, false);
        // store the address of the creator of the NFT in nftCreators mapping, using tokenId as the key
        nftCreators[tokenId] = msg.sender;

        emit NFTCreated(tokenId, name, description, 0);
    }

    function transferNFT(address to, uint256 tokenId) public {
        require(msg.sender == nftCreators[tokenId], "Only the creator can transfer the NFT.");
        
        // use safeTransferFrom function to transfer the NFT from sender's address to receiver's address
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
        require(nfts[tokenId].forSale, "This NFT is not for sale.");
        require(msg.value >= nfts[tokenId].price, "Insufficient funds to purchase this NFT.");
        require(balanceOf(nftCreators[tokenId], tokenId) > 0, "NFT has already been sold.");

        address seller = nftCreators[tokenId];
        require(seller != msg.sender, "You already own this NFT.");

        // Ensure the contract is approved to handle tokens on behalf of the seller.
        if (!isApprovedForAll(seller, address(this))) {
            setApprovalForAll(seller, true);
        }

        // Transfer the NFT token from the seller to the buyer.
        safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Update the token ownership and set the token as no longer for sale.
        nftCreators[tokenId] = msg.sender;
        nfts[tokenId].forSale = false;

        // Transfer the funds from the buyer to the seller.
        address payable sellerPayable = payable(seller);
        sellerPayable.sendValue(msg.value);

        emit NFTPurchased(tokenId, msg.sender, nfts[tokenId].price);
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        // mint a new token associated with tokenURI using abi-encoded data
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

    function printNFTsOwner(uint256 tokenId) view public returns (address){

        return nftCreators[tokenId];
    }

    function printNFTsPrice(uint256 tokenId) view public returns (uint256){

        return nfts[tokenId].price;
    }

    function printNFTsforSale(uint256 tokenId) view public returns (bool){

        return nfts[tokenId].forSale;
    }

    function printUserBalance(address user) view public returns (uint256){

        return user.balance;
    }

    function prinAllNFTsAvailableforSale() view public returns (string[] memory){
        string[] memory result;
        for(uint i = 1; i <= _tokenIds; i++){
            result[i-1] = nfts[i].name;
        }
        return result;  
    }

}
