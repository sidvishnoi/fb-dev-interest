const React = require('react');
const ReactDOM = require('react-dom');
const ApiKeyForm = require('./ApiKeyForm');
const BlacklistGroups = require('./BlacklistGroups');
const KeywordsFilter = require('./KeywordsFilter');

require('./react-tags.css');
require('./style.css');

class App extends React.Component {
  render() {
    return (
      <div>
        <h2 className="page-title">Settings: Facebook Developer Interests</h2>
        <ApiKeyForm/>
        <BlacklistGroups/>
        <KeywordsFilter/>
      </div>
    )
  };
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
