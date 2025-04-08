import * as fs from "fs";
import { parse } from "csv-parse";
import hre from "hardhat";

import minatoAddress from "./ignition/deployments/minato-deploy/deployed_addresses.json";
import soneiumAddress from "./ignition/deployments/soneium-deploy/deployed_addresses.json";
import { SonovaSBT } from "./typechain-types";
import { formatEther } from "ethers";

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
  const csvFilePath = "list.csv";

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

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
        distribute(result.slice(1).map((e) => e[0]));
      }
    }
  );
}

async function distribute(list: string[]) {
  const signer = (await hre.ethers.getSigners())[0];
  const SonovaSBTFactory = await hre.ethers.getContractFactory("SonovaSBT");
  const SonovaSBT = SonovaSBTFactory.attach(sbtAddress) as SonovaSBT;

  const batchSize = Math.ceil(list.length / groupSize);

  const balanceBefore = await hre.ethers.provider.getBalance(signer.address);
  let nonce = await hre.ethers.provider.getTransactionCount(signer.address);

  const txs = [];

  for (let i = 0; i < groupSize; i++) {
    const batch = list.slice(i * batchSize, (i + 1) * batchSize);
    if (batch.length === 0) {
      break;
    }
    console.log(`Distributing to group ${i + 1} of ${groupSize}`);
    txs.push((await SonovaSBT.batchMint(batch, { nonce: nonce + i })).wait());
  }

  await Promise.all(txs);
  console.log("All transactions completed");

  const balanceAfter = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Balance before: ${formatEther(balanceBefore)}
Balance after: ${formatEther(balanceAfter)}
Balance used: ${formatEther(balanceBefore - balanceAfter)}`);
}

main();
