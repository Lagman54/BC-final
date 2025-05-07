import { useEffect, useState } from "react";
import "./ProfilePage.css";
import { getMarketContract, getNFTContract, getProviderAndSigner, MARKET_ADDRESS } from "../services/contract";

export default function Profile() {
    const [ownedNFTs, setOwnedNFTs] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [giftAddress, setGiftAddress] = useState({});

    useEffect(() => {
        getOwnedNFTs();
    }, []);

    const getOwnedNFTs = async () => {
        setLoading(true);
        try {
            const nftContract = await getNFTContract();
            const { signer } = await getProviderAndSigner();
            const user = await signer.getAddress();
            const balance = await nftContract.balanceOf(user);
            const nftList = [];
            console.info(nftContract, user, balance);
            for (let i = 0; i < balance; i++) {
                const tokenId = await nftContract.tokenOfOwnerByIndex(user, i);
                const uri = await nftContract.tokenURI(tokenId);
                console.info("get token uri: ", uri);
                let metadata = await fetch(uri).then((res) => res.json())
                    .then(data => {
                        console.log('NFT Metadata:', data);
                        return data;
                    })
                    .catch(err => {
                        console.log('Error fetching metadata:', err);
                    });
                let imageURI;
                if (metadata === undefined) {
                    console.log("metadata is undefined");
                    metadata = { name: "none", description: "none" };
                    imageURI = uri;
                } else {
                    imageURI = metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
                    console.log(imageURI);
                }
                nftList.push({ tokenId: tokenId.toString(), image: imageURI, name: metadata.name, description: metadata.description });
            }

            setOwnedNFTs(nftList);
        } catch (e) {
            console.error("Error loading NFTs", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGiftNFT = async (tokenId) => {
        const nftContract = await getNFTContract();
        const market = await getMarketContract();

        try {
            const recipient = giftAddress[tokenId];

            if (!recipient || recipient.length !== 42) {
                alert("Please enter a valid address");
                return;
            }
            const approvedAddress = await nftContract.getApproved(tokenId);
            if (approvedAddress.toLowerCase() !== MARKET_ADDRESS.toLowerCase()) {
                alert("NFT needed to be approved first. Transaction for approval is pending.")
                const tx = await nftContract.approve(MARKET_ADDRESS, tokenId);
                await tx.wait();
                console.log(`Approved NFT [ID:${tokenId}]`);
            }
            const giftTx = await market.giftNFT(tokenId, recipient);
            await giftTx.wait();
            alert(`NFT [ID:${tokenId}] gifted successfully`);

            getOwnedNFTs();
        } catch (e) {
            console.error("Error gifting NFT", e);
            alert("Failed to gift NFT.");
        }
    };

    const handleGiftAddressChange = (tokenId, value) => {
        setGiftAddress((prev) => ({ ...prev, [tokenId]: value }));
    };

    return (
        <div>
            <h2>Your NFTs</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : ownedNFTs.length === 0 ? (
                <p>You don't own any NFTs yet.</p>
            ) : (
                <ul className="nft-grid">
                    {ownedNFTs.map((nft) => (
                        <div key={nft.tokenId} className="nft-card">
                            <img src={nft.image} alt={nft.name} className="nft-image" />
                            <p><strong>ID:</strong> {nft.tokenId}</p>
                            <p><strong>Name: {nft.name}</strong></p>
                            <p>Description: {nft.description}</p>
                            <input
                                type="text"
                                placeholder="Recipient address"
                                value={giftAddress[nft.tokenId] || ""}
                                onChange={(e) => handleGiftAddressChange(nft.tokenId, e.target.value)}
                                className="gift-input"
                            />
                            <div>
                                <button onClick={() => handleGiftNFT(nft.tokenId)} className="gift-btn">
                                    Gift
                                </button>
                            </div>
                        </div>
                    ))}
                </ul>
            )}
        </div>
    );
}
