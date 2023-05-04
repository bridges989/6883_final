// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// These files are dynamically created at test time
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
// import "../contracts/MetaCoin.sol";
import "../contracts/Math.sol";

contract TestMath {

  function testIfMathResultIsRight() public {
    //MetaCoin meta = MetaCoin(DeployedAddresses.MetaCoin());
    Math math = Math(DeployedAddresses.Math());
    
    //uint expected = 10000;
    
    // Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
    Assert.equal(math.mulAToB(3, 4), 2, "3 * 4 should be 12");

  }

  // function testInitialBalanceWithNewMetaCoin() public {
  //   MetaCoin meta = new MetaCoin();

  //   uint expected = 10000;

  //   Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }

}
