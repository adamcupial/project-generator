const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const Mustache = require('mustache');

const templateDir = path.join(__dirname, '..', 'template');

function readDirAsync(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function statAsync(node) {
  return new Promise((resolve, reject) => {
    fs.stat(node, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

function mkdirpAsync(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, null, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function fsCopyFileAsync(src, dest) {
  return mkdirpAsync(path.dirname(dest))
    .then(() => new Promise((resolve, reject) => {
      fs.copyFile(src, dest, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }));
}


function fsReadFileAsync(src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function fsWriteFileAsync(dest, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function processTemplateAsync(tmplFile, dest, data) {
  return mkdirpAsync(path.dirname(dest))
    .then(() => fsReadFileAsync(tmplFile)
      .then(tmpl => Mustache.render(tmpl, data))
      .then(rendered => fsWriteFileAsync(dest, rendered)));
}

function walk(dir) {
  return readDirAsync(dir)
    .then(list => Promise.all(list.map((file) => {
      const fl = path.resolve(dir, file);
      return statAsync(fl)
        .then((stat) => {
          if (stat.isDirectory()) {
            return walk(fl);
          }
          return fl;
        });
    })))
    .then(list => Array.prototype.concat.apply([], list));
}


function generator(basePath, data) {
  return walk(templateDir)
    .then(files => Promise.all(files.map((file) => {
      const relPath = path.relative(templateDir, file);
      const finalDist = path.join(basePath, relPath);
      if (path.extname(file) === '.tmpl') {
        return processTemplateAsync(file, finalDist.replace(/.tmpl$/, ''), data);
      }
      return fsCopyFileAsync(file, finalDist);
    })))
    .catch((err) => {
      console.log(err);
    });
}

module.exports = generator;
