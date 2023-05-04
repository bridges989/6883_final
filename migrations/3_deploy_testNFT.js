const testNFT = artifacts.require('testNFT');

module.exports = async function(deployer) {
    await deployer.deploy(testNFT);

  };
  