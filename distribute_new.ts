import * as fs from "fs";
import { parse } from "csv-parse";
import hre from "hardhat";

import minatoAddress from "./ignition/deployments/minato-deploy/deployed_addresses.json";
import soneiumAddress from "./ignition/deployments/soneium-deploy/deployed_addresses.json";
import { SonovaSBT } from "./typechain-types";
import { formatEther, getAddress } from "ethers";

const groupSize = 98;

const sbtAddress = (() => {
  switch (process.env.HARDHAT_NETWORK) {
    case "soneium-minato":
      return minatoAddress["SonovaModule#SonovaSBT"];
    case "soneium":
      return soneiumAddress["SonovaModule#SonovaSBT"];
    default:
      throw new Error("Invalid network");
  }
})();

async function main() {
  const csvFilePath = "new_list.csv";
  const alreadyDistributedCsvFilePath = "list.csv";
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  const alreadyDistributedFileContent = fs.readFileSync(
    alreadyDistributedCsvFilePath,
    { encoding: "utf-8" }
  );

  parse(
    fileContent,
    {
      columns: false,
      skipEmptyLines: true,
    },
    (err: any, result: string[][]) => {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        parse(
          alreadyDistributedFileContent,
          {
            columns: false,
            skipEmptyLines: true,
          },
          (err: any, alreadyDistributedResult: string[][]) => {
            const already = alreadyDistributedResult.map((e) => e[0]);
            const dif = result
              .map((e) => e[0])
              .filter((address) => !already.includes(address));
            const list = Array.from(new Set(dif));
            distribute(list.map(getAddress));
          }
        );
      }
    }
  );
}

async function checkHas(addr: string) {
  const SonovaSBTFactory = await hre.ethers.getContractFactory("SonovaSBT");
  const SonovaSBT = SonovaSBTFactory.attach(sbtAddress) as SonovaSBT;

  const bal = await SonovaSBT.balanceOf(addr);
  if (bal !== 0n) console.log(addr);
}

async function distribute(list: string[]) {
  const signer = (await hre.ethers.getSigners())[0];
  const SonovaSBTFactory = await hre.ethers.getContractFactory("SonovaSBT");
  const SonovaSBT = SonovaSBTFactory.attach(sbtAddress) as SonovaSBT;

  const batchSize = Math.ceil(list.length / groupSize);

  const balanceBefore = await hre.ethers.provider.getBalance(signer.address);

  for (let i = 63; i < groupSize; i++) {
    const batch = list.slice(i * batchSize, (i + 1) * batchSize);
    if (batch.length === 0) {
      break;
    }
    console.log(`Distributing to group ${i + 1} of ${groupSize}`);
    const tx = await SonovaSBT.batchMint(batch);
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
  }

  console.log("All transactions completed");

  const balanceAfter = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Balance before: ${formatEther(balanceBefore)}
Balance after: ${formatEther(balanceAfter)}
Balance used: ${formatEther(balanceBefore - balanceAfter)}`);
}

main();
