import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert('Install MetaMask');
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });
    }
  }, []);

  return (
    <header className="header">
      <h1 className="logo">NFT Market</h1>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/mint" className="nav-link">Mint</Link>
        <Link to="/buy" className="nav-link">Buy</Link>
      </nav>
      <button onClick={connectWallet} className="wallet-button">
        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>
    </header>
  );
}
