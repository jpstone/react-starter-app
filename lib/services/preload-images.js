const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports = getImages();

function getImages() {
  return fs.readdirAsync(__dirname + '/../assets/img')
  .map(image => {
    if (image !== '.DS_Store') {
      return (
        `<img
          src="assets/img/${image}"
          width="1"
          height="1"
          alt="${alt(image)}" />`
      );
    }
  });
}

function alt(image) {
  return image.replace(/(\b\w)/g, letter => letter.toUpperCase())
    .replace(/-/g, ' ').replace(/\.[a-z]{1,4}$/i, '');
}