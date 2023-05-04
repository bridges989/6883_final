const NFTMarketplace = artifacts.require('NFTMarketplace');

contract('NFTMarketplace', (accounts) => {
    it('should create a new NFT', async () => {
        const NFTInstance = await NFTMarketplace.deployed();

        const nftSender = accounts[0];

        await NFTInstance.createNFT("banana", "it is banana", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");
                
        const nftName = (await NFTInstance.printNFTsName.call(1)).toString();
        console.log(nftName);

        const nftDescription = (await NFTInstance.printNFTsDescription.call(1)).toString();
        console.log(nftDescription);

        assert(nftName == "banana", "The name is not correct");
        assert(nftDescription == "it is banana", "The description is not correct");
    })
    
    it('should send to the right address', async () => {
        const NFTInstance = await NFTMarketplace.deployed();

        const nftSender = accounts[0];
        const nftReveiver = accounts[1];

        await NFTInstance.createNFT("motorcycle", "it is motorcycle", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");
        
        var nftOwnership = (await NFTInstance.printNFTsOwner.call(2));
        console.log("Sender address: ", nftOwnership.toString());

        assert(nftOwnership == nftSender, "The NFT sender is not correct");

        await NFTInstance.transferNFT(nftReveiver, 2);

        nftOwnership =  (await NFTInstance.printNFTsOwner.call(2));
        console.log("Receiver address: ", nftOwnership.toString());

        assert(nftOwnership == nftReveiver, "The NFT receiver is not correct");
    })

    it('should list the right NFTs to sale', async () => {
        const NFTInstance = await NFTMarketplace.deployed();

        //const nftOwner = accounts[0];

        await NFTInstance.createNFT("car", "it is car", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");

        await NFTInstance.listNFTForSale(1, 1);
        //await NFTInstance.listNFTForSale(2, 100);
        await NFTInstance.listNFTForSale(3, 10000);

        const nftPrice = (await NFTInstance.printNFTsPrice.call(1));
        const nftforSale = (await NFTInstance.printNFTsforSale.call(1));

        assert(nftPrice == 1, "banana's price is wrong");
        assert(nftforSale == true, "banana's sale status is wrong");
    
    })

    it('should remove the right NFTs from sale list', async () => {
        const NFTInstance = await NFTMarketplace.deployed();

        await NFTInstance.createNFT("boat", "it is boat", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");

        await NFTInstance.listNFTForSale(4, 1000000);
        //await NFTInstance.listNFTForSale(2, 100);
        //await NFTInstance.listNFTForSale(3, 10000);

        const nftPrice = (await NFTInstance.printNFTsPrice.call(4));
        var nftforSale = (await NFTInstance.printNFTsforSale.call(4));

        assert(nftPrice == 1000000, "boat's price is wrong");
        assert(nftforSale == true, "boat's sale status is wrong");
        
        await NFTInstance.removeNFTFromSale(4);
        nftforSale = (await NFTInstance.printNFTsforSale.call(4));
        assert(nftforSale == false, "boat's sale status is wrong");
    
    })

    it('should purchase the right NFTs from sale list', async () => {
        const NFTInstance = await NFTMarketplace.deployed();

        await NFTInstance.createNFT("plane", "it is plane", "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json");

        await NFTInstance.listNFTForSale(5, 100);

        const seller = accounts[0];
        const buyer = accounts[1];
        console.log(seller.toString());
        console.log(buyer.toString());

        const buyBalanceBefore = await NFTInstance.printUserBalance.call(buyer);
        console.log(buyBalanceBefore.toString());

        await NFTInstance.purchaseNFT(5);

        const nftOwner = await NFTInstance.printNFTsOwner.call(5);

        console.log(nftOwner.toString());
        assert(buyer == nftOwner, "buyer is failed to buy the NFT");

        const buyBalanceAfter = await NFTInstance.printUserBalance.call(buyer);
        console.log(buyBalanceBefore.toString());

        const price = await NFTInstance.printNFTsPrice.call(5);

        assert((buyBalanceBefore - buyBalanceAfter) == price, "buyer paid wrong price");
    })
})