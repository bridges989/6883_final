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

        // Define seller and buyer accounts
        const seller = accounts[0];
        const buyer = accounts[1];
    
        // Token URI for the NFT
        const tokenURI = "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json";
    
        // Create an NFT with the seller account
        await NFTInstance.createNFT("plane", "it is a plane", tokenURI, { from: seller });
    
        // Define the tokenId and sale price
        const tokenId = 5;
        const salePrice = 100;
    
        // List the NFT for sale with the specified price
        await NFTInstance.listNFTForSale(tokenId, salePrice, { from: seller });
    
        // Set approval for the buyer to purchase the NFT
        await NFTInstance.setApprovalForAll(buyer, true, { from: seller });
    
        // Get the buyer's balance before the purchase
        const buyerBalanceBeforePurchase = await web3.eth.getBalance(buyer);
    
        // Purchase the NFT using the buyer account and specified sale price
        const txReceipt = await NFTInstance.purchaseNFT(tokenId, { from: buyer, value: salePrice });
    
        // Check if the NFT is now owned by the buyer
        const newOwner = await NFTInstance.nftCreators(tokenId);
        assert.equal(newOwner, buyer, "The NFT is not owned by the second user account");
    
        // Calculate the gas fee for the purchase transaction
        const txDetails = await web3.eth.getTransaction(txReceipt.tx);
        const gasUsed = txReceipt.receipt.gasUsed;
        const gasFee = web3.utils.toBN(gasUsed).mul(web3.utils.toBN(txDetails.gasPrice));
    
        // Get the buyer's balance after the purchase
        const buyerBalanceAfterPurchase = await web3.eth.getBalance(buyer);
    
        // Calculate the expected buyer's balance after the purchase
        const expectedBuyerBalance = web3.utils
          .toBN(buyerBalanceBeforePurchase)
          .sub(web3.utils.toBN(salePrice))
          .sub(gasFee);
    
        // Check if the correct amount of Ether was transferred to the seller
        assert.equal(
          buyerBalanceAfterPurchase,
          expectedBuyerBalance.toString(),
          "The correct amount of Ether was not transferred to the first user account"
          );
    })

    it("should execute an unsuccessful NFT purchase due to incorrect Ether amount", async () => {
        const NFTInstance = await NFTMarketplace.deployed();
    
        // Define seller and buyer accounts
        const seller = accounts[0];
        const buyer = accounts[1];
    
        // Token URI for the NFT
        const tokenURI = "https://ipfs.io/ipfs/bafybeiadjwxddlh4poqqa5i64hxypss4rbn6bxwxddbi5eh7tbyx3plo54/{id}.json";
    
        // Create an NFT with the seller account
        await NFTInstance.createNFT("plane", "it is a plane", tokenURI, { from: seller });
    
        // Define the tokenId and sale price
        const tokenId = 1;
        const salePrice = 100;
    
        // List the NFT for sale with the specified price
        await NFTInstance.listNFTForSale(tokenId, salePrice, { from: seller });
    
        // Set approval for the buyer to purchase the NFT
        await NFTInstance.setApprovalForAll(buyer, true, { from: seller });
        const buyerBalanceBeforePurchase = await web3.eth.getBalance(buyer);
        
        try {
          // Attempt to purchase the NFT with incorrect Ether amount
          await NFTInstance.purchaseNFT(tokenId, { from: buyer, value: salePrice - 1 });

          // If the transaction goes through, the test fails
          assert.fail("The purchase should have failed due to incorrect Ether amount");
        } catch (error) {
          // Check if the error message contains the expected revert reason
          assert(error.message.includes("Insufficient funds to purchase this NFT"), "Unexpected error occurred");
    
          // Check if the NFT is still owned by the seller
          const currentOwner = await NFTInstance.nftCreators(tokenId);
          assert.equal(currentOwner, seller, "The NFT should still be owned by the seller");
        
          // Check if the buyer been charged after false purchase
          const buyerBalanceAfterPurchase = await web3.eth.getBalance(buyer);
          assert.equal(buyerBalanceBeforePurchase, buyerBalanceAfterPurchase, "The buyer has been flase charged");
        }
      })
})