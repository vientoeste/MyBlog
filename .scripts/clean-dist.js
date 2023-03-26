const { rmSync } = require("fs");
const { resolve } = require("path");

const distFolder = resolve(__dirname, "..", "dist");

try {
  rmSync(distFolder, { recursive: true });
} catch (err) {
  console.error(`Error while deleting ${distFolder}.`);
}
