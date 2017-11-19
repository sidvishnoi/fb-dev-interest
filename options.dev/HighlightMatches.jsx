const React = require('react');
const ReactDOM = require('react-dom');
const ToggleButton = require('react-toggle-button');

class HighlightMatches extends React.Component {
  constructor (props) {
    super(props);
    this.state = { value: true };
    const self = this;
    chrome.storage.sync.get('highlightMatches', (res) => {
      self.setState({ value: typeof res.highlightMatches === 'undefined' ? true : res.highlightMatches })
    });
  }

  handleToggle(value) {
    this.setState({ value: !value });
    chrome.storage.sync.set({ highlightMatches: !value });
  }

  render() {
    return (
      <div>
        <h3>Highlight Keyword Matches</h3>
        <ToggleButton
          colors={{
              activeThumb: {
                base: 'rgb(62, 130, 247)',
              },
              inactiveThumb: {
                base: 'rgb(250, 250, 250)',
              },
              active: {
                base: 'rgb(65, 66, 68)',
                hover: 'rgb(95, 96, 98)',
              },
              inactive: {
                base: 'rgb(207, 221, 245)',
                hover: 'rgb(171, 191, 215',
              }
            }}
          trackStyle={{ height: '18px' }}
          thumbStyle={{ width: '22px', height: '22px', fontSize: '11px' }}
          thumbAnimateRange={[-3, 36]}
          value={ this.state.value }
          onToggle={ this.handleToggle.bind(this) }
        />
      </div>
    );
  }
};

module.exports = HighlightMatches;
