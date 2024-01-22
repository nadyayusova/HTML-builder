const path = require('path');
const fsPromise = require('fs/promises');

// Assets
const projectDirName = 'project-dist';
const projectDir = path.join(__dirname, projectDirName);
const fromAssetsDirName = 'assets';
const fromAssetsDir = path.join(__dirname, fromAssetsDirName);
// project-dist/assets
const toAssetsDirName = path.join(projectDirName, fromAssetsDirName);
const toAssetsDir = path.join(__dirname, toAssetsDirName);
// Styles
const stylesDirName = 'styles';
const stylesDir = path.join(__dirname, stylesDirName);
const bundleFileName = 'style.css';
const styleFilesContent = [];
// HTML
const componentsDirName = 'components';
const componentsDir = path.join(__dirname, componentsDirName);
const htmlTemplateFileName = 'template.html';
const htmlFileName = 'index.html';
const componentFilesContent = {};

async function getFiles(dir) {
  const dirContent = await fsPromise.readdir(dir, {withFileTypes: true});

  const files = await Promise.all(dirContent.map((item) => {
    const res = path.join(dir, item.name);

    return item.isDirectory() ? getFiles(res) : res;
  }));

  return files.flat();
}

// 1. Create project directory
// 2. Copy assets
// 3. Make styles bundle, place into project directory
// 4. Make html file from template, place into project directory

fsPromise.rm(projectDir, {recursive: true, force: true})
  .then(() => {
    fsPromise.mkdir(toAssetsDir, {recursive: true})
      .then(() => getFiles(fromAssetsDir))
      .then((files) => {
        files.forEach((file) => {
          const copyFullPath = file.replace(`${fromAssetsDir}`, `${toAssetsDir}`);

          fsPromise.mkdir(path.parse(copyFullPath).dir, {recursive: true})
            .then(() => fsPromise.copyFile(file, copyFullPath))
            .catch((err) => console.log(err));
        });
      });
  })
  .then(() => {
    fsPromise.readdir(stylesDir)
      .then((files) => {
        return Promise.all(files.map((file) => {
          if (path.extname(file) === '.css') {
            return fsPromise.readFile(path.join(stylesDir, file), 'utf-8')
              .then((data) => styleFilesContent.push(data));
          }
        }));
      })
      .then(() => {
        const bundleFullPath = path.join(projectDir, bundleFileName);
        const bundleContent = styleFilesContent.join(' ');

        fsPromise.writeFile(bundleFullPath, bundleContent);
      })
  })
  .then(() => {
    fsPromise.readdir(componentsDir)
      .then((files) => {
        return Promise.all(files.map((file) => {
          if (path.extname(file) === '.html') {
            return fsPromise.readFile(path.join(componentsDir, file), 'utf-8')
              .then((data) => componentFilesContent[path.parse(file).name] = data);
          }
        }));
      })
      .then(() => {
        return fsPromise.readFile(path.join(__dirname, htmlTemplateFileName), 'utf-8');
      })
      .then((data) => {
        let htmlContent = data;

        Object.keys(componentFilesContent).forEach((item) => {
          htmlContent = htmlContent.replace(`{{${item}}}`, componentFilesContent[item]);
        });

        return htmlContent;
      })
      .then((data) => {
        const htmlFullPath = path.join(projectDir, htmlFileName);

        fsPromise.writeFile(htmlFullPath, data);
      })
  })
  .catch((err) => console.log(err));
