function asyncParallel(tasks, cb) {
  var results, pending, keys
  var isSync = true

  if (Array.isArray(tasks)) {
    results = []
    pending = tasks.length
  } else {
    keys = Object.keys(tasks)
    results = {}
    pending = keys.length
  }

  function done(err) {
    function end() {
      if (cb) cb(err, results)
      cb = null
    }
    if (isSync) process.nextTick(end)
    else end()
  }

  function each(i, err, result) {
    results[i] = result
    if (--pending === 0 || err) {
      done(err)
    }
  }

  if (!pending) {
    // empty
    done(null)
  } else if (keys) {
    // object
    keys.forEach(function(key) {
      tasks[key](function(err, result) { each(key, err, result) })
    })
  } else {
    // array
    tasks.forEach(function(task, i) {
      task(function(err, result) { each(i, err, result) })
    })
  }

  isSync = false
}

// get access token from saved extension settings
function getAccessToken(callback) {
  chrome.storage.sync.get('apiKey', (res) => {
    if (!res.apiKey) {
      alert('API key not set.');
      return callback('API key not set.')
    };
    callback(null, res.apiKey);
  });
}

function getBlacklistedGroups(callback) {
  chrome.storage.sync.get('groups', (res) => {
    callback(null, res.groups || []);
  });
}

function getInterestKeywords(callback) {
  chrome.storage.sync.get('keywords', (res) => callback(null, res.keywords || []));
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

console.log('injecting..');
asyncParallel({
  getAccessToken,
  getBlacklistedGroups,
  getInterestKeywords,
}, (err, results) => {
  // inject scripts to page
  // https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script
  var script = document.createElement('script');
  script.textContent = `var fbDevInterest = {
    _apiKey: '${results.getAccessToken}',
    _blacklist: [${results.getBlacklistedGroups}],
    _keywords: new Set([${results.getInterestKeywords.map(v => `"${v}"`)}]),
    }`;
  (document.head||document.documentElement).appendChild(script);
  script.remove();

  injectScriptFile('utils.js', function(){
    injectScriptFile('fb-dev-merge.js');
  });
});
