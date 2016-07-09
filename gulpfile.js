'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const nodemon = require('nodemon');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const series = require('stream-series');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const http = require('http');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();

const path = {
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

const config = {
  port: 3000
};

gulp.task('start:server', () => {
  $.nodemon({
    script: 'server/app.js',
    watch: [path.pug, path.js.react.src, path.js.services, path.js.server]
  })
  .on('start', () => {
    whenServerReady(browserSync.reload);
  });
});

gulp.task('start:client', cb => {
  whenServerReady(() => {
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

gulp.task('reactify', () => {
  return gulp.src(path.js.react.src)
    .pipe($.react())
    .pipe(gulp.dest(path.js.react.dest));
});

gulp.task('browserify', () => {
  const b = browserify({
    entries: path.js.browserify.src,
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.js.browserify.dest));
});

gulp.task('clean', () => {
  return del([
    path.tmp,
    'bundle'
  ], {
    dot: true
  });
});

gulp.task('serve', cb => { 
  runSequence(
    ['clean', 'styles'],
    'reactify',
    'browserify',
    ['start:server', 'start:client'],
    'watch',
    cb
  );
});

gulp.task('styles', () => {
  const sassOptions = {
    style: 'expanded'
  };
  const variables = gulp.src(path.scss.variables, {read: false});
  const mixins = gulp.src(path.scss.mixins, {read: false});
  const inject = gulp.src([
    path.scss.src,
    `!${path.scss.main}`,
    `!${path.scss.variables}`,
    `!${path.scss.mixins}`,
    '!node_modules/**/*.scss'
  ], {read: false});
  const options = {
    transform: function(filePath) {
        return `@import "${filePath}";`;
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

gulp.task('watch', () => {

  gulp.watch(path.scss.src, ['styles']);

  gulp.watch(path.js.react.src, () => {
    runSequence('clean', 'reactify', 'browserify', 'reload');
  });

  gulp.watch(path.pug, ['reload']);

});

gulp.task('reload', function (cb) {
  browserSync.reload();
  cb();
})

function errorHandler(name) {
  return err => {
    $.util.log($.util.colors.red(`[${name}]`), err.toString());
    this.emit('end');
  }
}

function whenServerReady(cb) {
  let serverReady = false;
  const appReadyInterval = setInterval(() => {
  checkAppReady(ready => {
    if (!ready || serverReady) {
      return;
    }
    clearInterval(appReadyInterval);
    serverReady = true;
    if (cb) cb();
  })}, 100);
}

function checkAppReady(cb) {
  const options = {
    host: 'localhost',
    port: config.port
  };
  http.get(options, () => {
    cb(true);
  })
  .on('error', () => {
    cb(false);
  });
}
