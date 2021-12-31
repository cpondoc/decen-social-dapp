import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import abi from './utils/DecentralizedSocial.json';
import './App.css';

const App = () => {
  // Setters and Getters
  const [currentAccount, setCurrentAccount] = useState("");
  const [allPosts, setAllPosts] = useState([]);

  // Contract Address and ABI
  const contractAddress = "0x0284b53e63FDD5E9FeABc0a97d68c009391f6A6b";
  const contractABI = abi.abi;

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllPosts();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllPosts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const postContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const posts = await postContract.getAllPosts();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let postsCleaned = [];
        posts.forEach(post => {
          postsCleaned.push({
            address: post.poster,
            timestamp: post.timestamp,
            content: post.content
          });
        });

        /*
         * Store our data in React State
         */
        setAllPosts(postsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const createNewPost = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const postContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract
        */
        let message = "Woo";
        const postTxn = await postContract.createPost(message, { gasLimit: 300000 })

        console.log("Mining...", postTxn.hash);

        await postTxn.wait();
        console.log("Mined -- ", postTxn.hash);

        /*let count = await postContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());*/
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="container">
      <br />
      <h1>Feed</h1>
      <p>Catch up to date on all current events</p>
      {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
      )}
      {currentAccount && (<button type="button" className="btn btn-light" onClick={createNewPost}>
          Create New Post
        </button>)}
      {allPosts.map((post, index) => {
          return (
            <div key={index} className="card">
              <div className="card-body">
                <h3>{post.address}</h3>
                <h5>{post.timestamp.toString()}</h5>
                <p>{post.content}</p>
              </div>
              <div class="card-footer text-muted">
                <i class="bi bi-heart-fill"></i> Like
              </div>
          </div>
          )
        })}
      </div>
  );
}

export default App;
