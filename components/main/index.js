const React = require('react');
const ReactDOM = require('react-dom');

const Main = React.createClass({
  render() {
    return (
      <div />
    );
  }
});

if (process.browser) {
  ReactDOM.render(
    <Main />,
    document.getElementById('main')
  );
} else {
  module.exports = {
    element: Main,
    data: {}
  }
}