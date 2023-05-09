const { rmSync } = require("fs");
const { resolve } = require("path");

switch (process.argv[2]) {
  case 'server':
    const serverDistFolder = resolve(__dirname, "..", "server", "dist");
    try {
      rmSync(serverDistFolder, { recursive: true });
    } catch (err) {
      console.error(`Error while deleting ${serverDistFolder}.`);
    }
    break;
  case 'proxy':
    const proxyDistFolder = resolve(__dirname, "..", "proxy", "dist");
    try {
      rmSync(proxyDistFolder, { recursive: true });
    } catch (err) {
      console.error(`Error while deleting ${proxyDistFolder}.`);
    }
  default:
    break;
}
