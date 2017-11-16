const apiform = document.getElementById('set_api_key'),
  apiform_submit = document.querySelector('form#set_api_key button');

apiform.addEventListener('submit', saveApikey);
chrome.storage.sync.get('apiKey', (response) => {
  if (response.apiKey) {
    apiform.apikey.value = response.apiKey;
    apiform_submit.innerText = "Update API Key";
  }
});

function saveApikey(e) {
  e.preventDefault();
  const apiKey = apiform.apikey.value;
  chrome.storage.sync.set({'apiKey': apiKey}, () => apiform.apikey.classList.add('success'));
  console.log(apiKey);
}

// const request = new Request('https://www.facebook.com/pg/DeveloperCircles/groups/', {
//   mode: 'cors',
//   redirect: 'follow',
// });
// fetch(request)
//   .then((res) => res.text)
//   .then(console.log)
//   .catch((err) => console.error)

// get group from page (scrape)
// str = ''
// for (const group of $$('._266w a')) {
//   const name = group.innerText;
//   const id = group.getAttribute('data-hovercard').split("?id=")[1].split("&")[0];
//   const url = group.href;
//   console.log(name, id, url);
// }
