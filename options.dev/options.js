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


// Blacklist groups

const ALL_GROUPS = [{ "id": "249598592040574", "name": "Facebook Developer Circle: Delhi, NCR" }, { "id": "1378294582253698", "name": "Facebook Developer Circle: Nsukka" }, { "id": "2224932161064321", "name": "Facebook Developer Circle: Tunis" }, { "id": "1924443867832338", "name": "Facebook Developer Circle: Bangkok" }, { "id": "1922538421363451", "name": "Facebook Developer Circle: Santiago" }, { "id": "1920036621597031", "name": "Facebook Developer Circle: Malang" }, { "id": "1903916609822504", "name": "Facebook Developer Circle: Ado-Ekiti" }, { "id": "1841081392797911", "name": "Facebook Developer Circle: Surabaya" }, { "id": "1806620552895262", "name": "Facebook Developer Circle: Porto Alegre" }, { "id": "1780072415645281", "name": "Facebook Developer Circle: Chennai" }, { "id": "1741843536047014", "name": "Facebook Developer Circle: Kathmandu" }, { "id": "1724152667880378", "name": "Facebook Developer Circle: Berlin" }, { "id": "1607133026028061", "name": "Facebook Developer Circle: Accra" }, { "id": "1494181493938081", "name": "Facebook Developer Circle: Islamabad" }, { "id": "1443394385967980", "name": "Facebook Developer Circle: Kampala" }, { "id": "1258355007573190", "name": "Facebook Developer Circle: Cairo" }, { "id": "1152576018114322", "name": "Facebook Developer Circle: Bengaluru" }, { "id": "1148469218498930", "name": "Facebook Developer Circle: Lagos" }, { "id": "1075017422642967", "name": "Facebook Developer Circle: Ciudad de Guatemala" }, { "id": "1074858042611323", "name": "Facebook Developer Circle: Hyderabad" }, { "id": "1071045349642536", "name": "Facebook Developer Circle: Lahore" }, { "id": "1041205739348709", "name": "Facebook Developer Circle: Bogotá" }, { "id": "893652180764182", "name": "Facebook Developer Circle: Santa Rita do Sapucaí" }, { "id": "886251554842166", "name": "Facebook Developer Circle: São Paulo" }, { "id": "885490321621308", "name": "Facebook Developer Circle: Harare" }, { "id": "854314664699156", "name": "Facebook Developer Circle: Ho Chi Minh City" }, { "id": "826341790867138", "name": "Facebook Developer Circle: Guadalajara" }, { "id": "813879575430133", "name": "Facebook Developer Circle: Taipei" }, { "id": "811281355669013", "name": "Facebook Developer Circle: Dhaka" }, { "id": "793016410839401", "name": "Facebook Developer Circle: Karachi" }, { "id": "786453984830109", "name": "Facebook Developer Circle: Mumbai" }, { "id": "638854212931776", "name": "Facebook Developer Circle: Manila" }, { "id": "485698195138488", "name": "Facebook Developer Circle: Lille" }, { "id": "476463749198108", "name": "Facebook Developer Circle: Ciudad de México" }, { "id": "428973767504677", "name": "Facebook Developer Circle: Bali" }, { "id": "402137910152010", "name": "Facebook Developer Circle: Bandung" }, { "id": "362906487478469", "name": "Facebook Developer Circle: Geneva" }, { "id": "348458995586076", "name": "Facebook Developer Circle: Amman" }, { "id": "332006040559709", "name": "Facebook Developer Circle: Oldenburg" }, { "id": "313087542449350", "name": "Facebook Developer Circle: Jakarta" }, { "id": "309450039518404", "name": "Facebook Developer Circle: Vienna" }, { "id": "304477986647756", "name": "Facebook Developer Circle: Uyo" }, { "id": "293458267749614", "name": "Facebook Developer Circle: Yogyakarta" }, { "id": "265793323822652", "name": "Facebook Developer Circle: Casablanca" }, { "id": "223094988221674", "name": "Facebook Developer Circle: Buea" }, { "id": "199036970608482", "name": "Facebook Developer Circle: Paris" }, { "id": "187217085094857", "name": "Facebook Developer Circle: Dakar" }, { "id": "186924858495604", "name": "Facebook Developer Circle: Kolkata" }, { "id": "160941794378470", "name": "Facebook Developer Circle: Gaza" }, { "id": "152127978670639", "name": "Facebook Developer Circle: Cape Town" }, { "id": "132580147377707", "name": "Facebook Developer Circle: Buenos Aires" }, { "id": "125327974795168", "name": "Facebook Developer Circle: Madrid" }, { "id": "111858152705945", "name": "Facebook Developer Circle: Campinas" }]

const limit_groups_form = document.getElementById('limit_groups'),
  limit_groups_list = document.querySelector('#limit_groups #groups'),
  limit_groups_form_submit = document.querySelector('form#limit_groups button');

const addOption = ({ id, name }, selected) => {
  const option = document.createElement('option');
  option.value = id;
  option.selected = selected;
  option.innerText = `${name.split(':')[1]} - ${name}`;
  limit_groups_list.appendChild(option);
};

chrome.storage.sync.get('groups', (response) => {
  if (response.groups) {
    let blacklistedCount = 0;
    for (const group of ALL_GROUPS) {
      const selected = response.groups.includes(group.id);
      if (selected) blacklistedCount++;
      addOption(group, selected);
    }
    document.getElementById('blacklist_summary').innerText = `(Blaclisted ${blacklistedCount}/${ALL_GROUPS.length})`;
  } else {
    for (const group of ALL_GROUPS) {
      addOption(group, false);
    }
  }
});

limit_groups_form.addEventListener('submit', blacklistGroups);
function blacklistGroups(e) {
  e.preventDefault();
  const values = [];
  for (var i = 0; i < limit_groups_list.options.length; i++) {
    if (limit_groups_list.options[i].selected) {
      values.push(limit_groups_list.options[i].value);
    }
  }
  chrome.storage.sync.set({'groups': values}, () => limit_groups_form.groups.classList.add('success'));
};


// interest keywords
const set_keywords_form = document.getElementById('set_keywords');

chrome.storage.sync.get('keywords', (response) => {
  if (response.keywords) {
    const keywords = response.keywords.join(', ');
    set_keywords_form.keywords.value = keywords;
  }
});

set_keywords_form.addEventListener('submit', addKeywords);
function addKeywords(e) {
  e.preventDefault();
  const keywords = set_keywords_form.keywords.value.split(/,\s*/);
  chrome.storage.sync.set({'keywords': keywords}, () => set_keywords_form.keywords.classList.add('success'));
}
