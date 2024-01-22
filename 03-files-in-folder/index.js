const path = require('path');
const fsPromise = require('fs/promises');

const targetDir = path.join(__dirname, 'secret-folder');

fsPromise
  .readdir(targetDir)
  .then((files) => {
    files.forEach((file) => {
      const filePath = path.join(targetDir, file);

      fsPromise.lstat(filePath).then((stat) => {
        if (stat.isFile()) {
          const fileData = path.parse(path.join(targetDir, file));

          console.log(
            `${fileData.name} - ${fileData.ext.slice(1)} - ${(
              stat.size / 1024
            ).toFixed(2)} kb`,
          );
        }
      });
    });
  })
  .catch((err) => console.log(err));
