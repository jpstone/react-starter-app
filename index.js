var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var npm = Promise.promisifyAll(require('npm'));
var cliColor = require('cli-color');

module.exports = scaffold;

function scaffold() {
  console.log(cliColor.blue('Scaffolding app...'));
  readdirRecursive(__dirname + '/lib')
  .map(function (item) {
    if (item.isDirectory) {
      return fs.mkdirAsync(process.cwd() + item.path.split('lib')[1]);
    } else {
      return fs.readFileAsync(item.path, 'utf8')
        .then(function (contents) {
          return fs.writeFileAsync(
            process.cwd() + item.path.split('lib')[1],
            contents,
            'utf8'
          );
        });
    }
  })
  .all()
  .then(function () {
    console.log(cliColor.blue('Finished scaffolding app'));
    console.log(cliColor.green('Installing npm modules...'));
    return npm.loadAsync();
  })
  .then(function (npmInstance) {
    npmInstance.install(process.cwd());
  })
  .catch(function (err) {
    console.log(cliColor.red(err.stack));
  });
}

function readdirRecursive(dir) {
  return fs.readdirAsync(dir)
  .reduce(function (paths, item) {
    return fs.lstatAsync(dir + '/' + item)
    .then(function (stats) {
      if (stats.isFile()) {
        paths.push({
          path: dir + '/' + item,
          stats: stats,
          isFile: true
        });
      } else if (stats.isDirectory()) {
        paths.push({
          path: dir + '/' + item,
          stats: stats,
          isDirectory: true
        });
        return readdirRecursive(dir + '/' + item)
        .each(function (results) {
          paths.push(results);
        });
      }
    })
    .then(function () {
      return paths;
    })
  }, []);
}