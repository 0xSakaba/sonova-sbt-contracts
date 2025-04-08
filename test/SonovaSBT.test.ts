import { expect } from "chai";
import hre from "hardhat";
import { Signer } from "ethers";
import { SonovaSBT } from "../typechain-types";

describe("SonovaSBT", function () {
  let SonovaSBT: SonovaSBT;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const SonovaSBTFactory = await hre.ethers.getContractFactory("SonovaSBT");
    SonovaSBT = await SonovaSBTFactory.deploy("https://example.com/");
  });

  it("Should deploy the contract", async function () {
    expect(await SonovaSBT.name()).to.equal(
      "Sonova - Ecosystem badge on Soneium"
    );
    expect(await SonovaSBT.symbol()).to.equal("SonovaSBT");
  });

  it("Should allow the admin to distribute tokens", async function () {
    await SonovaSBT.connect(owner).batchMint([
      await addr1.getAddress(),
      await addr2.getAddress(),
    ]);

    expect(await SonovaSBT.ownerOf(1)).to.be.equal(await addr2.getAddress());
    expect(await SonovaSBT.ownerOf(2)).to.be.equal(await addr1.getAddress());
  });

  it("Should not allow owner to transfer tokens", async function () {
    await expect(
      SonovaSBT.connect(addr1).transferFrom(
        await addr1.getAddress(),
        await addr2.getAddress(),
        1
      )
    ).to.be.revertedWith("This is a Soulbound Token and cannot be transferred");

    await expect(
      SonovaSBT.connect(addr2)["safeTransferFrom(address,address,uint256)"](
        await addr2.getAddress(),
        await addr1.getAddress(),
        2
      )
    ).to.be.revertedWith("This is a Soulbound Token and cannot be transferred");
  });
});
