const NFTMarketplace = artifacts.require('NFTMarketplace');

contract('NFTMarketplace', (accounts) => {
    it('should create a new NFT', async () => {
        const NFTInstance = await NFTMarketplace.deployed();
        await NFTInstance.createNFT("banana", "it is banana", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");
        
        const nftName = NFTInstance.printNFTsName(1);
        const nftDescription = NFTInstance.printNFTsDescription(1);

        assert(nftName != "banana", "The name is not correct");
        assert(nftDescription != "it is banana", "The description is not correct");
    })
})