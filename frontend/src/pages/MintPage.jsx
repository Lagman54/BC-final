import { useState } from 'react';
import { getNFTContract } from '../services/contract';
import './MintPage.css';

export default function MintPage() {
  const [uri, setUri] = useState('');

  async function handleMint() {
    try {
      const contract = await getNFTContract();
      const tx = await contract.mintNFT(uri);
      await tx.wait();
      alert('NFT Minted!');
    } catch (err) {
      console.error(err);
      alert('Mint failed');
    }
  }

  return (
    <div className="mint-container">
      <h2 className="mint-title">Mint New NFT</h2>
      <input
        type="text"
        placeholder="Enter token URI"
        value={uri}
        onChange={e => setUri(e.target.value)}
        className="mint-input"
      />
      <button
        onClick={handleMint}
        className="mint-button"
      >
        Mint NFT
      </button>
    </div>
  );
}
