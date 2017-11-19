const React = require('react');
const ReactDOM = require('react-dom');

class ApiKeyForm extends React.Component {
  constructor() {
    super();
    this.state = { value: '', status: 'Set API Key' };
    chrome.storage.sync.get('apikey', (res) => {
      if (res.apikey)
        this.setState({ value: res.apikey, status: 'Modify API Key' });
    });
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value, status: 'Update API Key' });
  }

  handleSubmit(event) {
    event.preventDefault();
    const self = this;
    chrome.storage.sync.set({ apikey: self.state.value }, () => {
      self.setState({ status: 'Saved' });
      setTimeout(function() {
        self.setState({ status: 'Modify API Key' })
      }, 1500);
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="apikey_form">
         <label htmlFor="apikey">
           <h3>Facebook Graph API Key (App Token) <a target="_blank" className="hint" href="https://developers.facebook.com/tools/accesstoken/">?</a></h3>
         </label>
         <div className="form-group">
          <input type="text" name="apikey" id="apikey" value={this.state.value} onChange={this.handleChange} spellCheck="false" required/>
          <button>{this.state.status}</button>
         </div>
       </form>
    );
  }
};

module.exports = ApiKeyForm;
