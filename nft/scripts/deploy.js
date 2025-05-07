const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    const NFTContract = await ethers.getContractFactory("NFTContract");
    const nftContract = await NFTContract.deploy();

    await nftContract.waitForDeployment();
    console.log("NFT contract deployed to:", await nftContract.getAddress());

      
    console.log("Deploying contracts with the account:", deployer.address);
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy(await nftContract.getAddress());
    await nftMarket.waitForDeployment();
    console.log("NFTMarket deployed to:", await nftMarket.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  