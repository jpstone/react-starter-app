const router = require('express-promise-router')();
const React = require('react');
const ReactDOM = require('react-dom/server');
const components = require('../.tmp/components');
const preloadImages = require('../services/preload-images');

router.get('/', (req, res) => {
  preloadImages.then(images => {
    res.render('index', {
      main: createFactory('Main'),
      preloadedImages: images.join('\n'),
      title: components.Main.title || 'React Starter App'
    });
  });
});

module.exports = router;

function createFactory(name) {
  const component = React.createFactory(components[name].element);
  return ReactDOM.renderToString(component(components[name].data || {}));
}