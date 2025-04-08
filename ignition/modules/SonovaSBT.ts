// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const input_baseTokenURI =
  "ipfs://bafkreicqngst4355kfsqxev3gpsoapglynqf45dceje7fy74yqxr6urd3q";

const SonovaModule = buildModule("SonovaModule", (m) => {
  const baseTokenURI = m.getParameter("baseTokenURI", input_baseTokenURI);

  const Sonova = m.contract("SonovaSBT", [baseTokenURI]);

  return { Sonova };
});

export default SonovaModule;
