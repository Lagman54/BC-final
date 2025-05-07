import { useState } from 'react';
import { getNFTContract } from '../services/contract';
import './MintPage.css';

export default function MintPage() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function uploadToPinata(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', options);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyODcwOWI1Yy1kMmY0LTQxYzYtYTBhNi00ZTc3M2RmM2I5NTIiLCJlbWFpbCI6ImFpYmFyLmt5ZGlhcnhhbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiN2JhMGNjNzJjYzVkZjBjNDY0MDMiLCJzY29wZWRLZXlTZWNyZXQiOiJkNzViNjlhY2VjZjAwZjE2NGY2ZTA0MWMzMDlhMzQ0M2EyZjE5OTJiYmMwOTA1NWY4MGU0NzgzNWIyODZkZWQ3IiwiZXhwIjoxNzc4MTUzODA1fQ.rnkw-uqqnfmoygHTufLnqlAc8vMGWHB5L6lPHzFmw8I', // ⬅️ Замени на свой токен
      },
      body: formData,
    });

    const data = await res.json();
    if (!data.IpfsHash) throw new Error('Pinata upload failed');
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  }

  async function handleMint() {
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      const uri = await uploadToPinata(file);
      const contract = await getNFTContract();
      const tx = await contract.mintNFT(uri);
      await tx.wait();
      alert('NFT Minted!');
    } catch (err) {
      console.error(err);
      alert('Mint failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mint-container">
      <h2 className="mint-title">Mint New NFT</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) setFile(e.target.files[0]);
        }}
        className="mint-input"
      />
      <button onClick={handleMint} className="mint-button" disabled={isLoading}>
        {isLoading ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
}
