import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { getMarketContract, getNFTContract } from '../services/contract';
import './BuyPage.css';

export default function BuyPage() {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    async function loadListings() {
      const market = await getMarketContract();
      const nft = await getNFTContract();
      const listings = [];

      for (let i = 1; i <= 20; i++) {
        try {
          const info = await market.nftListings(i);
          if (info.active) {
            const uri = await nft.tokenURI(i);
            listings.push({ tokenId: i, price: info.price, uri });
          }
        } catch {}
      }

      setNfts(listings);
    }

    loadListings();
  }, []);

  async function handleBuy(tokenId, price) {
    const market = await getMarketContract();
    const tx = await market.buyNFT(tokenId, { value: price });
    await tx.wait();
    alert('Purchase successful!');
  }

  return (
    <div className="buy-page">
      <h2 className="market-title">Marketplace</h2>
      <div className="nft-grid">
        {nfts.map(nft => (
          <div key={nft.tokenId} className="nft-card">
            <img src={nft.uri} alt="NFT" className="nft-image" />
            <p className="nft-id">ID: {nft.tokenId}</p>
            <p className="nft-price">Price: {ethers.formatEther(nft.price)} ETH</p>
            <button
              onClick={() => handleBuy(nft.tokenId, nft.price)}
              className="buy-btn"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
