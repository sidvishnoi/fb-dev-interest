const React = require('react');
const ReactDOM = require('react-dom');
const ApiKeyForm = require('./ApiKeyForm.jsx');
const BlacklistGroups = require('./BlacklistGroups.jsx');
const KeywordsFilter = require('./KeywordsFilter.jsx');
const HighlightMatches = require('./HighlightMatches.jsx');

require('./react-tags.css');
require('./style.css');

class App extends React.Component {
  render() {
    return (
      <div>
        <h2 className="page-title">Settings: Facebook Developer Interests</h2>
        <ApiKeyForm/>
        <KeywordsFilter/>
        <HighlightMatches/>
        <BlacklistGroups/>
      </div>
    )
  };
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
