var cliColor = require('cli-color');
var gulp = require('gulp');
var install = require('gulp-install');

module.exports = scaffold;

function scaffold() {
  return gulp.src(__dirname + '/lib')
    .pipe(gulp.dest(process.cwd()))
    .pipe(process.stdout.write(cliColor.green('Installing npm packages...')))
    .pipe(install())
    .pipe(process.stdout.write(cliColor.green('Finished installing npm packages'))
    .pipe(process.stdout.write(cliColor.green('All done! Run "gulp serve" to start your app')));
}