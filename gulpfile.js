'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var nodemon = require('nodemon');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var series = require('stream-series');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var http = require('http');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

var path = {
  js: {
    browserify: {
      src: '.tmp/components/index.js',
      dest: 'bundle'
    },
    react: { 
      src: 'components/**/*.js',
      dest: '.tmp/components'
    },
    services: 'services/**/*.js',
    server: 'server/**/*.js'
  },
  pug: 'views/**/*.pug',
  css: {
    dest: 'css',
    main: 'css/styles.css'
  },
  scss: {
    variables: 'scss/variables.scss',
    mixins: 'scss/mixins.scss',
    src: '**/*.scss',
    main: 'scss/styles.scss'
  },
  img: 'img/**/*',
  tmp: '.tmp'
};

var config = {
  port: 3000
};

gulp.task('start:server', function () {
  /*process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  nodemon('-w ' + path.pug + ' -w ' + path.js.react.src +
    ' -w ' + path.js.server + ' server/app.js')
  .on('log', onServerLog);*/
  $.nodemon({
    script: 'server/app.js',
    watch: [path.pug, path.js.react.src, path.js.services, path.js.server]
  })
  .on('start', function () {
    whenServerReady(function () {
      browserSync.reload();
    });
  });
});

gulp.task('reactify', function () {
  return gulp.src(path.js.react.src)
    .pipe($.react())
    .pipe(gulp.dest(path.js.react.dest));
});

gulp.task('browserify', function () {
  var b = browserify({
    entries: path.js.browserify.src,
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.js.browserify.dest));
});

gulp.task('clean', function () {
  return del([
    path.tmp,
    'bundle'
  ], {
    dot: true
  });
});

gulp.task('serve', function (cb) { 
  runSequence(
    ['clean', 'styles'],
    'reactify',
    'browserify',
    ['start:server', 'start:client'],
    'watch',
    cb
  )
});

gulp.task('styles', function () {
  var sassOptions = {
    style: 'expanded'
  };
  var variables = gulp.src('scss/variables.scss', {read: false});
  var mixins = gulp.src('scss/mixins.scss', {read: false});
  var inject = gulp.src([
    path.scss.src,
    '!' + path.scss.main,
    '!' + path.scss.variables,
    '!' + path.scss.mixins,
    '!node_modules/**/*.scss'
  ], {read: false});
  var options = {
    transform: function(filePath) {
        return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src(path.scss.main)
    .pipe($.inject(series(variables, mixins, inject), options))
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.css.dest));
});

gulp.task('start:client', function (cb) {
  whenServerReady(function () {
    browserSync.init({
      proxy: 'http://localhost:3000',
      browser: ['google chrome'],
      port: 8888,
      notify: false,
      files: [path.css.main, path.img]
    });
    cb();
  });
});

gulp.task('watch', function () {

  gulp.watch([path.scss.src], function () {
    runSequence('styles');
  });

  gulp.watch(path.js.react.src, function () {
    runSequence('clean', 'reactify', 'browserify', 'reload');
  });

  gulp.watch(path.pug, ['reload']);

});

gulp.task('reload', function (cb) {
  browserSync.reload();
  cb();
})

function errorHandler(name) {
  return (
    function (err) {
      $.util.log($.util.colors.red('[' + name + ']'), err.toString());
      this.emit('end');
    }
  );
}

function whenServerReady(cb) {
  var serverReady = false;
  var appReadyInterval = setInterval(function () {
  checkAppReady(function (ready) {
    if (!ready || serverReady) {
      return;
    }
    clearInterval(appReadyInterval);
    serverReady = true;
    if (cb) cb();
  })}, 100);
}

function checkAppReady(cb) {
  var options = {
    host: 'localhost',
    port: config.port
  };
  http.get(options, function () {
    cb(true);
  })
  .on('error', function () {
    cb(false);
  });
}
