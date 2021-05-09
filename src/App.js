import React, { Component, Fragment } from 'react'
import Swaping from './ABI/Swaping.json'
import IERC20 from './ABI/IERC20.json'
import ERC20 from './ABI/ERC20.json'
import IUniswapV2Router02 from './ABI/IUniswapV2Router02.json'
import Web3 from 'web3'
import Navbar from './Navbar'
import Header from './Header'

export class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      swapping: null,
      ierc20: null,
      erc20: null,
      unsiswap:null,
      loading: false,
      balance:''
    }
  }

  componentWillMount() {
    this.loadWeb3()
    this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert("Please Install Metamask...")
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log(this.state.account)

    const networkId = await web3.eth.net.getId()
    console.log(networkId)

    if (networkId === 3) {
    const swap = new web3.eth.Contract(Swaping, "0x95F1518A7212F67920aC9c9db142a518e9b9e697")
    this.setState({ swapping: swap })

    const uniswap = new web3.eth.Contract(IUniswapV2Router02, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    this.setState({ uniswap: uniswap })
    
    const erctoken = new web3.eth.Contract(IERC20, IERC20.address)
    this.setState({ ierc20: erctoken })
      
    const ercContract = new web3.eth.Contract(ERC20, "0xad6d458402f60fd3bd25163575031acdce07538d")
    this.setState({ erc20: ercContract })
    
    console.log(this.state.swapping,this.state.erc20,this.state.ierc20, this.state.uniswap)

    const balances = await this.state.swapping.methods.balances(this.state.account).call()
    this.setState({ balance: balances })
    console.log(this.state.balance)
    } else {
      alert("Smart contract not deployed to this network..")
    }
  }


  async swap(tokenAddress, tokenValue) {
    this.setState({ loading: true })
    await this.state.erc20.methods.approve("0x95F1518A7212F67920aC9c9db142a518e9b9e697", tokenValue).send({from: this.state.account})
      .then(() => {
        this.state.swapping.methods.swapTokens(tokenAddress, tokenValue).send({ from: this.state.account })
        .then((res) => [
          console.log(res)
        ]).catch((error) => {
        console.log(error)
      })
      }).catch((error) => {
      console.log(error)
      })
    this.setState({ loading: false})
  }

  withdrawToken() {
    if (this.state.swapping) {
      this.setState({ loading: true })
      this.state.swapping.methods.withdraw().send({from: this.state.account})
        .then((res) => {
          console.log(res)
        }).catch((error) => {
       console.log(error)
       })
     this.setState({loading: false})
    }
  }

  render() {

    return (
      <Fragment>
        <Navbar />
        <div className="mt-5 container">
        <Header accounts={this.state.account} balances={this.state.balance} />
        <hr />
          {this.state.loading ? <div className="text-center">
            <button className="btn btn-primary" type="button" disabled>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Loading...
             </button>
          </div> : <div className="container">
            <form onSubmit={(event) => {
          event.preventDefault()
          const tokenAddress = this.address.value
          const tokenValue = this.amount.value
          this.swap(tokenAddress, tokenValue)
        }}>
         <div className="form-group row">
          <label className="col-sm-2 col-form-label">Token Address</label>
          <div className="col-sm-10">
                <input
                type="text"
                className="form-control"
                value="0xad6d458402f60fd3bd25163575031acdce07538d"      
                ref={(input) => {this.address = input}}
              />
          </div>
          </div>
          <br/>
          <div className="form-group row">
          <label className="col-sm-2 col-form-label">Token Amount</label>
          <div className="col-sm-10">
              <input type="Number"
                className="form-control"
                placeholder="Enter amount of tokens eg.1000"
                ref={(input) => {this.amount = input}}
              />
          </div>
          </div>
          <br/>
          <button className="btn btn-outline-success">Submit</button>
        </form>
        <br />
        <button className="btn btn-outline-danger" onClick={() => this.withdrawToken()}>Withdraw</button>
          </div>}
      </div>
       </Fragment>
    )
  }
}

export default App

