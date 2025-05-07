import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { getMarketContract, getNFTContract, getProviderAndSigner, MARKET_ADDRESS } from '../services/contract';
import './BuyPage.css';

export default function BuyPage() {
  const [nfts, setNfts] = useState([]);
  const [tokenForSaleId, setTokenForSaleId] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
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
              seller: info.seller,
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
  async function handleBuy(tokenId, price) {
    try {
      const market = await getMarketContract();
      const tx = await market.buyNFT(tokenId, { value: price });
      await tx.wait();
      loadListings();
      alert('Purchase successful!');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed');
    }
  }

  const sellNFT = async () => {
    try {
      const nftContract = await getNFTContract();
      const market = await getMarketContract();
      const { signer } = await getProviderAndSigner();
      const isApproved = await nftContract.isApprovedForAll(await signer.getAddress(), MARKET_ADDRESS);
      if (!isApproved) {
        alert("Need to approve NFTs. Transaction approval is pending.")
        const approvalTx = await nftContract.setApprovalForAll(MARKET_ADDRESS, true);
        await approvalTx.wait();
        console.log("Approved marketplace");
      }

      const tx = await market.listNFTForSale(tokenForSaleId, price);
      await tx.wait();
      alert("NFT listed for sale!");
      setTokenForSaleId("");
      setPrice("");
      loadListings();
    } catch (err) {
      console.error("Listing failed", err);
      alert("Listing failed");
    }
  };

  return (
    <div className="buy-page">
      <h2>List NFT for Sale</h2>
      <input
        type="number"
        placeholder="Token ID"
        value={tokenForSaleId}
        onChange={(e) => setTokenForSaleId(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Price in wei"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="input-field"
      />
      <button onClick={sellNFT} disabled={!tokenForSaleId || !price} className="buy-btn">
        List NFT
      </button>
      <br></br>
      <br></br>
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
