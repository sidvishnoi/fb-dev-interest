// js smooth scroll
// https://jsfiddle.net/s61x7c4e/
function scrollToItem(element, duration = 1000) {
  const getElementY = (el) => window.pageYOffset + el.getBoundingClientRect().top;
  const easing = (t) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
  var startingY = window.pageYOffset;
  var elementY = getElementY(element);
  var targetY = ((document.body.scrollHeight - elementY < window.innerHeight) ? document.body.scrollHeight - window.innerHeight : elementY) - 100;
  var diff = targetY - startingY;
  var start;
  if (!diff) return;
  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    var time = timestamp - start;
    var percent = Math.min(time / duration, 1);
    percent = easing(percent);
    window.scrollTo(0, startingY + diff * percent);
    if (time < duration) window.requestAnimationFrame(step);
  });
}

var ALL_GROUPS = [249598592040574,1378294582253698,2224932161064321,1924443867832338,1922538421363451,1920036621597031,1903916609822504,1841081392797911,1806620552895262,1780072415645281,1741843536047014,1724152667880378,1607133026028061,1494181493938081,1443394385967980,1258355007573190,1152576018114322,1148469218498930,1075017422642967,1074858042611323,1071045349642536,1041205739348709,893652180764182,886251554842166,885490321621308,854314664699156,826341790867138,813879575430133,811281355669013,793016410839401,786453984830109,638854212931776,485698195138488,476463749198108,428973767504677,402137910152010,362906487478469,348458995586076,332006040559709,313087542449350,309450039518404,304477986647756,293458267749614,265793323822652,223094988221674,199036970608482,187217085094857,186924858495604,160941794378470,152127978670639,132580147377707,125327974795168,111858152705945]; // all public groups

// remove blacklisted groups
for (let groupId of fbDevInterest._blacklist) {
  let idx = ALL_GROUPS.indexOf(parseInt(groupId, 10));
  ALL_GROUPS.splice(idx, 1);
}

fbDevInterest.createPlaceholder = function() {
  const fbfeed_placeholder_story = `<div class="_2iwo"><div class="_2iwq"><div class="_1enb"></div><div class="_2iwr"></div><div class="_2iws"></div><div class="_2iwt"></div><div class="_2iwu"></div><div class="_2iwv"></div><div class="_2iww"></div><div class="_2iwx"></div><div class="_2iwy"></div><div class="_2iwz"></div><div class="_2iw-"></div><div class="_2iw_"></div><div class="_2ix0"></div></div></div>`;
  const placeholder = document.createElement('div');
  placeholder.classList.add(...'_4-u2 mbm _2iwp _4-u8'.split(' '));
  placeholder.innerHTML = fbfeed_placeholder_story;
  return placeholder;
};

fbDevInterest.BASE_API_URL = `https://graph.facebook.com/v2.11/GROUPID/?&access_token=${fbDevInterest._apiKey}&fields=name,id,feed{message,id,name,from,permalink_url,full_picture,link,created_time}`;

// gets a group id from ALL_GROUPS list
fbDevInterest.getGroupId = {};
fbDevInterest.getGroupId = (function *() {
    let i = -1;
    while (true) {
      yield this.ALL_GROUPS[++i % ALL_GROUPS.length];
    };
  })();

fbDevInterest.parent = document.querySelector('#pagelet_group_pager'); // feed parent
fbDevInterest.state = {}; // stores next fetch urls for group and group names


fbDevInterest.satisfiesFilters = function(content) {
  if (this._keywords.size === 0) return true;
  const contentKeywords = new Set(content.toLowerCase().split(' '));
  const matches = this._keywords.intersection(contentKeywords);
  console.log(matches)
  return matches.size > 0;
}

// appends a post in feed
fbDevInterest.showPost = function(entry, group) {
  if (!entry.message) return;
  if (!this.satisfiesFilters(entry.message)) return;
  entry.message = entry.message.replace(/\n/g, "</p><p>").linkify();
  if (entry.link && !entry.full_picture) {
    entry.message = `${entry.message} </p><p>[<a href="${entry.link}" target="_blank">${entry.link}</a>]`;
  }

  const created_time = new Date(entry.created_time);

  const image = (entry.full_picture && !entry.full_picture.includes('//external.'))
    ? `<div class="_3x-2"><div><div class="mtm"><div><a class="_4-eo _2t9n _50z9" ajaxify="${entry.link}&player_origin=groups" data-ploi="${entry.full_picture}&player_origin=groups" href="${entry.link}" data-render-location="group"><div class="uiScaledImageContainer _517g"><img class="scaledImageFitWidth img" src="${entry.full_picture}"></div></a></div></div></div></div>`
    : '';

  const basePost = `
    <div class="_3ccb">
      <div></div>
      <div class="_5pcr userContentWrapper">
        <div class="_1dwg _1w_m _q7o">
          <h5>
            <a href="https://www.facebook.com/${entry.from.id}">${entry.from.name}</a>
    ‎         ▶
            <a href="https://www.facebook.com/${group.id}">${group.name}</a>
          </h5>
          <div class="_5pcp _5lel _232_"><span class="_5paw _14zs"><a class="_3e_2 _14zr" href="#"></a></span><span role="presentation" aria-hidden="true"> · </span><span class="fsm fwn fcg"><a class="_5pcq" href="${entry.permalink_url}" target="_blank"><abbr title="${created_time.format('dddd, d MMMM yyyy at HH:mm')}" class="_5ptz"><span class="timestampContent">${created_time.format('d MMMM at HH:mm')}</span></abbr>
            </a>
            </span>
          </div>
          <div class="_5pbx userContent _22jv _3576">
            <p>${entry.message}</p>
            ${image}
          </div>
          <div></div>
        </div>
      </div>
    </div>
    `;
  const p = document.createElement('div');
  p.classList.add(...'_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8'.split(' '));
  p.id = `mall_post_${entry.id}:6:0`;
  p.innerHTML = basePost;

  const placeholder = document.querySelector('._4-u2.mbm._2iwp._4-u8')
  if (placeholder) this.parent.replaceChild(p, placeholder)
  else this.parent.appendChild(p);
};

// gets feed json and shows posts
fbDevInterest.getGroupFeed = function(options) {
  let fetchUrl = this.BASE_API_URL
    .replace('GROUPID', options.groupId)
  const state = this.state[options.groupId];
  if (state && state.nextPageUrl) {
    fetchUrl = state.nextPageUrl;
  }

  console.log(fetchUrl)

  fetch(fetchUrl)
    .then((res) => res.json())
    .then(json => {
      if (json.error) throw json.error;
      if (!json.feed) {
        if (!Array.isArray(json.data)) {
          throw `failed to fetch: ${fetchUrl}`;
        } else {
          json.feed = json;
        }
      }
      this.state[options.groupId] = this.state[options.groupId] || { name: json.name };
      this.state[options.groupId].nextPageUrl = json.feed.paging.next;
      for (const entry of json.feed.data) {
        this.showPost(entry, { name: this.state[options.groupId].name, id: options.groupId });
      }
      this.showPostsOnScroll();
    })
    .catch((err) => {
      if (err) {
        const p = document.createElement('div');
        p.classList.add(...'_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8'.split(' '));
        p.innerHTML = `<div class="_3ccb"><div class="_5pcr userContentWrapper"><div class="_1dwg _1w_m _q7o"><div class="_5pbx userContent _22jv _3576">
          <pre>${JSON.stringify(err, null, 2)}</pre>
          </div></div></div></div>`;
        p.style.color = 'red';
        this.parent.appendChild(p);
      }
    });
};

fbDevInterest.clearPosts = function() {
  const removeElements = (elms) => Array.from(elms).forEach(el => el.remove());
  removeElements(document.querySelectorAll('._4mrt._5jmm._5pat._5v3q._4-u8')); // posts
  removeElements(document.querySelectorAll('._5umn')); // pinned post labels etc
  removeElements(document.querySelectorAll('._4wcq')); // recent acitivity label etc

  // XXX: prevent infinite scroll
  window.addEventListener('scroll', (e) => e.stopPropagation(), true);
};

fbDevInterest.getFeed = function() {
  this.clearPosts();
  const placeholder = this.createPlaceholder();
  for (let i = 0; i < 5; ++i) this.parent.appendChild(placeholder);
  scrollToItem(this.parent);
  this.getGroupFeed({ groupId: this.getGroupId.next().value });
};

fbDevInterest.showPostsOnScroll = function() {
  const self = this;
  function isScrolledIntoView(el) {
    var elemTop = el.getBoundingClientRect().top;
    var elemBottom = el.getBoundingClientRect().bottom;
    var isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
  }
  const a = document.querySelectorAll('._4mrt._5jmm._5pat._5v3q._4-u8');
  const last = a[a.length -1 ];
  const onVisible = function(e) {
    if (!last) return self.getGroupFeed({ groupId: self.getGroupId.next().value });
    if (isScrolledIntoView(last)) {
      window.removeEventListener('scroll', onVisible, true);
      const placeholder = self.createPlaceholder();
      for (let i = 0; i < 5; ++i) self.parent.appendChild(placeholder);
      self.getGroupFeed({ groupId: self.getGroupId.next().value });
    }
  };
  window.addEventListener('scroll', onVisible, true)
}

console.log('<<< fbDevInterest >>>');
fbDevInterest.parent.innerHTML = '';
fbDevInterest.getFeed();
