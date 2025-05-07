import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { getMarketContract, getNFTContract } from '../services/contract';
import './BuyPage.css';

export default function BuyPage() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function loadListings() {
      try {
        const market = await getMarketContract();
        const nft = await getNFTContract();
        const listings = [];
        const tokenCnt = await nft.tokenIdCounter();
        for (let i = 1; i <= tokenCnt; i++) {
          try {
            const info = await market.nftListings(i);
            if (info.active) {
              const uri = await nft.tokenURI(i);
              console.log(`Token ${i} URI: ${uri}`);

              // Проверка URI
              if (!uri.startsWith('http')) continue;

              const res = await fetch(uri);
              if (!res.ok) {
                console.warn(`Failed to fetch metadata for token ${i}`);
                continue;
              }

              const metadata = await res.json();
              if (!metadata.image) {
                console.warn(`Token ${i} metadata has no image`);
                continue;
              }

              listings.push({
                tokenId: i,
                price: info.price,
                imageUrl: metadata.image,
                name: metadata.name || `NFT #${i}`,
                description: metadata.description || 'No description',
              });
            }
          } catch (err) {
            console.warn(`Error processing token ${i}:`, err.message);
          }
        }

        setNfts(listings);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadListings();

  }, []);

  async function handleBuy(tokenId, price) {
    try {
      setLoading(true);
      const market = await getMarketContract();
      const tx = await market.buyNFT(tokenId, { value: price });
      await tx.wait();
      alert('Purchase successful!');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="buy-page">
      <h2 className="market-title">Marketplace</h2>
      {
        loading ? (
          <p> Loading...</p>
        ) : nfts.length === 0 ? (
          <p>No NFTs listed on market</p>
        ) : (
          <div className="nft-grid">
            {nfts.map(nft => (
              <div key={nft.tokenId} className="nft-card">
                <img src={nft.imageUrl} alt={nft.name} className="nft-image" />
                <p className="nft-id">ID: {nft.tokenId}</p>
                <p className="nft-seller">Seller: {nft.seller}</p>
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
        )}
    </div>
  );
}
