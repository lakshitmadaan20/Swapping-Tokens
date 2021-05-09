pragma solidity ^0.7.0;

interface IUniswapV2Router02 {
    
    function swapExactTokensForETH(uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline)
    external
    returns (uint[] memory amounts);
        
    function WETH() external pure returns(address);
    
}

interface IERC20 {
    function transferFrom(address from, address to, uint value) external returns (bool);
    function approve(address spender, uint value) external returns (bool);
}


contract Swaping{
    
   address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
   IUniswapV2Router02 uniswapRouter;
   
   mapping(address => uint) public balances;
   
    
    constructor(){
    uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
    }


  function swapTokens(
  address token,
  uint amountIn)
  public {
      IERC20(token).transferFrom(msg.sender, address(this), amountIn);
      address[] memory path = new address[](2);
      path[0] = token;
      path[1] = uniswapRouter.WETH();
      IERC20(token).approve(address(uniswapRouter), amountIn);
      uint a = address(this).balance;
      uniswapRouter.swapExactTokensForETH(
          amountIn,
          0,
          path,
          address(this),
          block.timestamp + 180
      );
      uint b = address(this).balance;
      uint c = sub(b,a);
      balances[msg.sender] += c;
  }
   
  function withdraw() public {
      require(balances[msg.sender] > 0);
      msg.sender.transfer(balances[msg.sender]);
  }
  
  receive() payable external {}
}