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
  chrome.storage.sync.get('apikey', (res) => {
    if (!res.apikey) {
      alert('API key not set.');
      return callback('API key not set.')
    };
    callback(null, res.apikey);
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

function getHighlightMatches(callback) {
  chrome.storage.sync.get('highlightMatches', (res) => callback(null, typeof res.highlightMatches === 'undefined' ? true : res.highlightMatches));
}

// inject scripts to page: https://stackoverflow.com/a/9517879
function injectScriptFile(fname, callback) {
  const s = document.createElement('script');
  s.src = chrome.extension.getURL(fname);
  s.onload = function() {
    this.remove();
    callback();
  };
  (document.head||document.documentElement).appendChild(s);
}

function injectScriptText(str) {
  var script = document.createElement('script');
  script.textContent = str;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

asyncParallel({
  getAccessToken,
  getBlacklistedGroups,
  getInterestKeywords,
  getHighlightMatches,
}, (err, results) => {
  if (err) return alert(err.message || err);

  const keywords = [...results.getInterestKeywords].map(k => k.name);
  injectScriptText(`var fbDevInterest = {
    _apiKey: '${results.getAccessToken}',
    _blacklist: [${results.getBlacklistedGroups}],
    _keywords: new Set([${keywords.map(v => `'${v}'`)}]),
    _highlightMatches: ${results.getHighlightMatches},
    }`);

  asyncParallel({
    utils: cb => injectScriptFile('utils.js', cb),
    groups: cb => injectScriptFile('groups.js', cb),
    inject: cb => injectScriptFile('inject.js', cb),
  }, (err, res) => {
    injectScriptText(`
      console.log('<<< fbDevInterest >>>');
      fbDevInterest.parent.innerHTML = '';
      fbDevInterest.getFeed();
    `);
  });
});
