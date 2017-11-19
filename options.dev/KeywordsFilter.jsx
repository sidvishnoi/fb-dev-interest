const React = require('react');
const ReactDOM = require('react-dom');
const ReactTags = require('react-tag-autocomplete');

let keywords = require('./keywords');

class KeywordsFilter extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      tags: [],
      suggestions: keywords,
    };
    chrome.storage.sync.get('keywords', (res) => {
      const $keywords = res.keywords || [];
      keywords = [...keywords, ...$keywords];
      const selectedKeywords = $keywords.map((keyword) => {
        return keywords.find(k => k.name === keyword.name);
      });
      const newSuggestions = keywords.filter((keyword) => {
        const toRemove = !($keywords.includes(keyword.name));
        return toRemove;
      });

      this.setState({ tags: selectedKeywords, suggestions: newSuggestions });
    });
  }

  handleDelete (i) {
    const tags = this.state.tags.slice(0);
    const removed = tags.splice(i, 1);
    const updatedSuggestions = [...this.state.suggestions, ...removed];

    this.setState({ tags, suggestions: updatedSuggestions });
    chrome.storage.sync.set({ keywords: tags });
  }

  handleAddition (tag) {
    if (!tag.id) tag.id = -1*(this.state.tags.length + this.state.suggestions.length + 1);
    let tags = [].concat(this.state.tags, tag);
    tags = tags.filter(Boolean);

    const updatedSuggestions = this.state.suggestions.filter((group) => {
      return group.id !== tag.id;
    });

    this.setState({ suggestions: updatedSuggestions, tags });

    chrome.storage.sync.set({ keywords: tags });
  }

  render () {
    return (
      <div>
        <h3>My Interests</h3>
        <ReactTags
          tags={this.state.tags}
          suggestions={this.state.suggestions}
          placeholder='Add a keyword'
          handleDelete={this.handleDelete.bind(this)}
          handleAddition={this.handleAddition.bind(this)}
          allowNew={true} />
      </div>
    )
  }
};

module.exports = KeywordsFilter;
