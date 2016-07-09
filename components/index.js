 'use strict';

if (process.browser) {
  require('babel-core');
  require('react-tap-event-plugin')();
  require('./main');
} else {
  exports.Main = require('./main');
}
