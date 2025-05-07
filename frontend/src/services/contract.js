import { ethers } from 'ethers';
import NFTContractABI from '../contracts/NFTContractABI.json';
import NFTMarketABI from '../contracts/NFTMarketABI.json';

const NFT_ADDRESS = '0x138216d3E86241b31b9200Ae747103e754022aAd';
const MARKET_ADDRESS = '0x3B38Fc5AC76F45e2199116eE24552dC1bDCf5315';

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
