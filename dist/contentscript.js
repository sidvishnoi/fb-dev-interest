function asyncParallel(e,t){function n(e){function n(){t&&t(e,i),t=null}r?process.nextTick(n):n()}function c(e,t,c){i[e]=c,(0==--s||t)&&n(t)}var i,s,o,r=!0;Array.isArray(e)?(i=[],s=e.length):(o=Object.keys(e),i={},s=o.length),s?o?o.forEach(function(t){e[t](function(e,n){c(t,e,n)})}):e.forEach(function(e,t){e(function(e,n){c(t,e,n)})}):n(null),r=!1}function getAccessToken(e){chrome.storage.sync.get("apikey",t=>{if(!t.apikey)return alert("API key not set."),e("API key not set.");e(null,t.apikey)})}function getBlacklistedGroups(e){chrome.storage.sync.get("groups",t=>{e(null,t.groups||[])})}function getInterestKeywords(e){chrome.storage.sync.get("keywords",t=>e(null,t.keywords||[]))}function getHighlightMatches(e){chrome.storage.sync.get("highlightMatches",t=>e(null,void 0===t.highlightMatches||t.highlightMatches))}function injectScriptFile(e,t){const n=document.createElement("script");n.src=chrome.extension.getURL(e),n.onload=function(){this.remove(),t()},(document.head||document.documentElement).appendChild(n)}function injectScriptText(e){var t=document.createElement("script");t.textContent=e,(document.head||document.documentElement).appendChild(t),t.remove()}asyncParallel({getAccessToken:getAccessToken,getBlacklistedGroups:getBlacklistedGroups,getInterestKeywords:getInterestKeywords,getHighlightMatches:getHighlightMatches},(e,t)=>{if(e)return alert(e.message||e);const n=[...t.getInterestKeywords].map(e=>e.name);injectScriptText(`var fbDevInterest = {\n    _apiKey: '${t.getAccessToken}',\n    _blacklist: [${t.getBlacklistedGroups}],\n    _keywords: new Set([${n.map(e=>`'${e}'`)}]),\n    _highlightMatches: ${t.getHighlightMatches},\n    }`),asyncParallel({utils:e=>injectScriptFile("utils.js",e),groups:e=>injectScriptFile("groups.js",e),inject:e=>injectScriptFile("inject.js",e)},(e,t)=>{injectScriptText("\n      console.log('<<< fbDevInterest >>>');\n      fbDevInterest.parent.innerHTML = '';\n      fbDevInterest.init();\n    ")})});