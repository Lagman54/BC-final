import { useState } from 'react';
import { getNFTContract } from '../services/contract';
import './MintPage.css';

export default function MintPage() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyODcwOWI1Yy1kMmY0LTQxYzYtYTBhNi00ZTc3M2RmM2I5NTIiLCJlbWFpbCI6ImFpYmFyLmt5ZGlhcnhhbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiN2JhMGNjNzJjYzVkZjBjNDY0MDMiLCJzY29wZWRLZXlTZWNyZXQiOiJkNzViNjlhY2VjZjAwZjE2NGY2ZTA0MWMzMDlhMzQ0M2EyZjE5OTJiYmMwOTA1NWY4MGU0NzgzNWIyODZkZWQ3IiwiZXhwIjoxNzc4MTUzODA1fQ.rnkw-uqqnfmoygHTufLnqlAc8vMGWHB5L6lPHzFmw8I';

  async function uploadImageToPinata(file) {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append('pinataMetadata', metadata);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!data.IpfsHash) 
      throw new Error('Pinata upload failed');
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  }

  const uploadMetadataToPinata = async (imageUrl) => {
    const metadata = {
      name: name,
      description: "Minted via frontend",
      image: imageUrl,
    };

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  async function handleMint() {
    if (!file) {
      alert('Please select an image');
      return;
    }

    try {
      setIsLoading(true);
      console.log("uploading nft: ", name);
      const imageUrl = await uploadImageToPinata(file);
      const contract = await getNFTContract();
      const tokenURI = await uploadMetadataToPinata(imageUrl);
      const tx = await contract.mintNFT(tokenURI);
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
        type="text"
        placeholder="Nft name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />
      <br></br>
      <br></br>
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
