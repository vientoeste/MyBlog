const {
  existsSync,
  lstatSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  readdirSync,
} = require('fs');
const { join, basename, resolve } = require("path");

const copyFileSync = (source, target) => {
  const targetFile =
    existsSync(target) && lstatSync(target).isDirectory()
      ? join(target, basename(source))
      : target;

  writeFileSync(targetFile, readFileSync(source));
}

const copyFolderRecursiveSync = (source, target) => {
  const targetFolder = join(target, basename(source));
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder);
  }

  if (lstatSync(source).isDirectory()) {
    const files = readdirSync(source);
    files.forEach(function (file) {
      const curSource = join(source, file);
      if (lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

const source = resolve(__dirname, "..", "client/build");
const target = resolve(__dirname, "..", "proxy/dist");
try {
  copyFolderRecursiveSync(source, target);
} catch (e) {
  console.error("Failed to copy over client", e);
}
