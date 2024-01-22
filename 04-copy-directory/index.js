const path = require('path');
const fsPromise = require('fs/promises');

const fromDirName = 'files';
const fromDir = path.join(__dirname, fromDirName);
const toDirName = `${fromDirName}-copy`;
const toDir = path.join(__dirname, toDirName);

async function getFiles(dir) {
  const dirContent = await fsPromise.readdir(dir, {withFileTypes: true});

  const files = await Promise.all(dirContent.map((item) => {
    const res = path.join(dir, item.name);

    return item.isDirectory() ? getFiles(res) : res;
  }));

  return files.flat();
}

fsPromise.rm(toDir, {recursive: true, force: true})
  .then(() => {
    fsPromise.mkdir(toDir, {recursive: true})
      .then(() => getFiles(fromDir))
      .then((files) => {
        files.forEach((file) => {
          const copyFullPath = file.replace(`${fromDir}`, `${toDir}`);

          fsPromise.mkdir(path.parse(copyFullPath).dir, {recursive: true})
            .then(() => fsPromise.copyFile(file, copyFullPath))
            .catch((err) => console.log(err));
        });
      });
  });
