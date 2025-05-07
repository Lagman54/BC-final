import Web3 from 'web3';
import NFTContractABI from './NFTContractABI.json'; // ABI of your NFT contract

const web3 = new Web3(window.ethereum); // Or use Web3 provider setup

const nftContractAddress = 'YOUR_CONTRACT_ADDRESS';
const nftContract = new web3.eth.Contract(NFTContractABI, nftContractAddress);

export const mintNFT = async (uri) => {
  const accounts = await web3.eth.getAccounts();
  await nftContract.methods.mintNFT(uri).send({ from: accounts[0] });
};

export const getNFTs = async () => {
  const totalSupply = await nftContract.methods.totalSupply().call();
  const nfts = [];

  for (let i = 0; i < totalSupply; i++) {
    const tokenId = await nftContract.methods.tokenByIndex(i).call();
    const tokenURI = await nftContract.methods.tokenURI(tokenId).call();
    nfts.push({ tokenId, tokenURI });
  }

  return nfts;
};
