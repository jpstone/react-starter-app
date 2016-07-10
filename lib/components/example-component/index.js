const React = require('react');

const ExampleComponent = React.createClass({
  render() {
    return (
      <div className={this.props.className}>{this.props.content}</div>
    );
  }
});

module.exports = ExampleComponent;