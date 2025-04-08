// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const input_baseTokenURI =
  "ipfs://bafkreiftxzifx7jupyd5zds2ban5sac3gjbfub5f7in2ezzc64ummlutua";

const SonovaModule = buildModule("SonovaModule", (m) => {
  const baseTokenURI = m.getParameter("baseTokenURI", input_baseTokenURI);

  const Sonova = m.contract("SonovaSBT", [baseTokenURI]);

  return { Sonova };
});

export default SonovaModule;
