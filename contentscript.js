// get access token from saved extension settings
function getAccessToken(callback) {
  chrome.storage.sync.get('apiKey', (res) => {
    if (!res.apiKey) {
      alert('API key not set.');
      throw 'API key not set.'
    };
    callback(res.apiKey);
  });
}

function injectScriptFile(fname, callback) {
  const s = document.createElement('script');
  s.src = chrome.extension.getURL(fname);
  s.onload = function() {
    this.remove();
    if (typeof callback === 'function') callback();
  };
  (document.head||document.documentElement).appendChild(s);
}

console.log('injecting..')
getAccessToken((apiKey) => {
  // inject scripts to page https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script
  var script = document.createElement('script');
  script.textContent = `var fbDevInterest = {
    API_KEY: '${apiKey}', // make api key available to injected script
    PREFERENCES: {},
    }`;
  (document.head||document.documentElement).appendChild(script);
  script.remove();

  injectScriptFile('utils.js', function(){
    injectScriptFile('fb-dev-merge.js');
  });

});
