chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'localhost' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'https://www.facebook.com/groups/' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.pageAction.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id,
    {code: `document.body.style.background = '#e9ebee';`},
    function() {
    chrome.tabs.executeScript(tab.id, { file: 'contentscript.js' });
  });
});
