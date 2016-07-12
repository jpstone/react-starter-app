var cliColor = require('cli-color');
var gulp = require('gulp');
var install = require('gulp-install');

module.exports = scaffold;

function scaffold() {
  return gulp.src(__dirname + '/lib')
    .pipe(gulp.dest(process.cwd()))
    .pipe(console.log(cliColor.blue(
      'Finished scaffolding app',
      'Installing npm packages...'
    )))
    .pipe(install());
    .pipe(console.log(cliColor.green(
      'Finished installing npm packages',
      'All done! Run "gulp serve" to start your app'
    )));
}