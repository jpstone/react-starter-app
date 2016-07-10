const React = require('react');
const ReactDOM = require('react-dom');
const ExampleComponent = require('../example-component');

const data = {
  exampleComponent: {
    content: 'Hello, world!',
    className: 'hello-world'
  }
};

const Main = React.createClass({
  render() {
    return (
      <div className="main-container">
        <ExampleComponent
          className={this.props.exampleComponent.className}
          content={this.props.exampleComponent.content} />
      </div>
    );
  }
});

if (process.browser) {
  ReactDOM.render(
    <Main exampleComponent={data.exampleComponent} />,
    document.getElementById('main')
  );
} else {
  module.exports = {
    element: Main,
    data: data
  }
}