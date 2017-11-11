chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'localhost' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.pageAction.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id, {
    code: 'var color = "green";'
  }, function() {
    chrome.tabs.executeScript(tab.id, { file: 'script.js' });
  });
});
