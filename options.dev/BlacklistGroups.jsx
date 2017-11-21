const React = require('react');
const ReactDOM = require('react-dom');
const ReactTags = require('react-tag-autocomplete');
const groups = require('./groups');

class BlacklistGroups extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      tags: [],
      suggestions: groups,
    };
    chrome.storage.sync.get('groups', (res) => {
      const $groups = res.groups || [];
      const blacklistGroups = $groups.map((id) => {
        return groups.find(g => g.id === id);
      });
      const newSuggestions = groups.filter((group) => {
        const toRemove = !($groups.includes(group.id));
        return toRemove;
      });
      this.setState({ tags: blacklistGroups, suggestions: newSuggestions });
    });
  }

  handleDelete (i) {
    const tags = this.state.tags.slice(0);
    const removed = tags.splice(i, 1);
    this.setState({ tags });

    const updatedSuggestions = [...this.state.suggestions, ...removed];
    this.setState({ suggestions: updatedSuggestions });

    const blacklistedGroupIds = tags.map((group) => group.id);
    chrome.storage.sync.set({ groups: blacklistedGroupIds });
  }

  handleAddition (tag) {
    let tags = [].concat(this.state.tags, tag);
    tags = tags.filter(Boolean);
    this.setState({ tags });

    const updatedSuggestions = this.state.suggestions.filter((group) => {
      return group.id !== tag.id;
    });
    this.setState({ suggestions: updatedSuggestions });

    const blacklistedGroupIds = tags.map((group) => group.id);
    chrome.storage.sync.set({ groups: blacklistedGroupIds });
  }

  clearStorage() {
    chrome.storage.sync.remove('keywords');
    window.location.href = '';
  }

  render () {
    return (
      <div>
        <h3>Blacklist Groups <small onClick={this.clearStorage} title="Clear Storage" style={{float: 'right', cursor: 'pointer', color: '#777'}}>✕</small></h3>
        <ReactTags
          tags={this.state.tags}
          suggestions={this.state.suggestions}
          placeholder='Add a group'
          handleDelete={this.handleDelete.bind(this)}
          handleAddition={this.handleAddition.bind(this)} />
      </div>
    )
  }
};

module.exports = BlacklistGroups;
