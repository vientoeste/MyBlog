const { rmSync } = require("fs");
const { resolve } = require("path");

const serverDistFolder = resolve(__dirname, "..", "server", "dist");
const proxyDistFolder = resolve(__dirname, "..", "server", "dist");

try {
  rmSync(proxyDistFolder, { recursive: true });
  rmSync(serverDistFolder, { recursive: true });
} catch (err) {
  console.error(`Error while deleting ${proxyDistFolder}.`);
  console.error(`Error while deleting ${serverDistFolder}.`);
}
