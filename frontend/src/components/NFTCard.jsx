import './NFTCard.css';

export default function NFTCard({ tokenId, image, owner, price, onBuy }) {
  return (
    <div className="nft-card">
      <img
        src={image}
        alt={`NFT ${tokenId}`}
        className="nft-image"
      />
      <p className="token-id">Token ID: {tokenId}</p>
      {owner && <p className="owner">Owner: {owner}</p>}
      {price && <p className="price">{price} ETH</p>}
      {onBuy && (
        <button onClick={onBuy} className="buy-button">
          Buy
        </button>
      )}
    </div>
  );
}
