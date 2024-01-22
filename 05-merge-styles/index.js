const path = require('path');
const fsPromise = require('fs/promises');

const stylesDirName = 'styles';
const stylesDir = path.join(__dirname, stylesDirName);
const projectDistDirName = 'project-dist';
const projectDistDir = path.join(__dirname, projectDistDirName);
const bundleFileName = 'bundle.css';
const styleFilesContent = [];

fsPromise
  .readdir(stylesDir)
  .then((files) => {
    return Promise.all(
      files.map((file) => {
        if (path.extname(file) === '.css') {
          return fsPromise
            .readFile(path.join(stylesDir, file), 'utf-8')
            .then((data) => styleFilesContent.push(data));
        }
      }),
    );
  })
  .then(() => fsPromise.mkdir(projectDistDir, { recursive: true }))
  .then(() => {
    const bundleFullPath = path.join(projectDistDir, bundleFileName);
    const bundleContent = styleFilesContent.join(' ');

    fsPromise.writeFile(bundleFullPath, bundleContent);
  });
