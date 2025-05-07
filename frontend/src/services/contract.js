import { ethers } from 'ethers';
import NFTContractABI from '../contracts/NFTContractABI.json';
import NFTMarketABI from '../contracts/NFTMarketABI.json';

const NFT_ADDRESS = '0x565FB145C2FE5E248D8D2Da308ebc81c63142305';
export const MARKET_ADDRESS = '0xba7572D904a6E3029707537eBcE2E9F9b71Da635';

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getNFTContract() {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(NFT_ADDRESS, NFTContractABI, signer);
}

export async function getMarketContract() {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(MARKET_ADDRESS, NFTMarketABI, signer);
}
