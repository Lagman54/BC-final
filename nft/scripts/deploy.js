const { ethers } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contract with account: ${deployer.address}`);

  const nft = await ethers.getContractFactory(
    "NFTContract"
  );
  const nftContract = await nft.deploy(); 
  nftContract.waitForDeployment(); 
  console.log("NFT contract deployed to:", await nftContract.getAddress());


  const marketPlace = await ethers.getContractFactory(
    "NFTMarket"
  );
  const nftMarket = await marketPlace.deploy(await nftContract.getAddress());
  await nftMarket.waitForDeployment();
  console.log("NFTMarket deployed to:", await nftMarket.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
