// remove blacklisted groups
fbDevInterest.clearBlacklist = function() {
  for (let groupId of this._blacklist) {
    let idx = this.ALL_GROUPS.indexOf(parseInt(groupId, 10));
    this.ALL_GROUPS.splice(idx, 1);
  }
}

fbDevInterest.createPlaceholder = function() {
  const fbfeed_placeholder_story = `<div class="_2iwo _3f3l" data-testid="fbfeed_placeholder_story"><div class="_2iwq"><div class="_1enb"></div><div class="_2iwr"></div><div class="_2iws"></div><div class="_2iwt"></div><div class="_2iwu"></div><div class="_2iwv"></div><div class="_2iww"></div><div class="_2iwx"></div><div class="_2iwy"></div><div class="_2iwz"></div><div class="_2iw-"></div><div class="_2iw_"></div><div class="_2ix0"></div></div></div>`;
  const placeholder = document.createElement('div');
  placeholder.classList.add(...'_3-u2 mbm _2iwp _4-u8'.split(' '));
  placeholder.innerHTML = fbfeed_placeholder_story;
  return placeholder;
};

fbDevInterest.BASE_API_URL = `https://graph.facebook.com/v2.11/GROUPID/?&access_token=${fbDevInterest._apiKey}&fields=name,id,feed{message,id,name,from,permalink_url,full_picture,link,created_time}`;

// gets a group id from ALL_GROUPS list
fbDevInterest.getGroupId = {};
fbDevInterest.getGroupId = function () {
  const self = this;
  let i = -1;
  return (function *() {
    while (true) {
      yield self.ALL_GROUPS[++i % self.ALL_GROUPS.length];
    };
  })();
}

fbDevInterest.parent = document.querySelector('#pagelet_group_mall'); // feed parent
fbDevInterest.state = {}; // stores next fetch urls for group and group names

// find matching keywords in post body
fbDevInterest.findMatchedKeywords = function(content) {
  if (this._keywords.size === 0) return [[0, 0]];
  const $content = content.toLowerCase();
  const matches = [];
  for (const keyword of this._keywords) {
    const re = new RegExp(`(?:^|\\b)(${keyword.replace(/\s\s+/g, '\\s*')})(?=\\b|$)`);
    const match = $content.match(re);
    if (match) matches.push([match.index, match[0].length])
  }
  function compare(a,b) {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[1] < b[1]) return 1; // to have larger keyword before
    if (a[1] > b[1]) return -1;
    return 0;
  }
  return matches.sort(compare);
}

// highlight matched keywords in post body
fbDevInterest.highlightMatches = function(str, matches) {
  let $str = ''
  let pos;
  let flag = 0;
  const alreadyIncludedStart = new Set();
  for (let i = 0; i < matches.length; ++i) {
    pos = (i === 0) ? 0 : matches[i-1][0] + matches[i-1][1];
    const [ $start, $length ] = matches[i];
    if (alreadyIncludedStart.has($start)) {
      flag = matches[i-1][0] + matches[i-1][1];
      continue; // to prevent highlight again if a smaller keyword in a larger keyword
    }
    alreadyIncludedStart.add($start);
    $str += `${str.substring(flag !== 0 ? flag : pos, $start)}<mark>${str.substring($start, $start + $length)}</mark>`;
    flag = 0;
  }
  const lastMatch = matches[matches.length - 1];
  $str += str.substring(lastMatch[0] + lastMatch[1]);
  return $str;
}

// split post body if too long
fbDevInterest.splitPostBody = function(content) {
  const splitted = content.split('</p>');
  if (splitted.length < 6) return content;
  const visible = splitted.slice(0, 6).join('</p>');
  const hidden = splitted.slice(6).join('</p>');

  const id = Math.random().toString().replace('.', '');
  const postBody = `<div id="id_${id}" class="text_exposed_root">${visible}<span class="text_exposed_hide">...</span><div class="text_exposed_show">${hidden}</div><span class="text_exposed_hide"> <span class="text_exposed_link"><a class="see_more_link" onclick="var func = function(e) { e.preventDefault(); }; var parent = Parent.byClass(this, 'text_exposed_root'); if (parent && parent.getAttribute('id') == 'id_${id}') { CSS.addClass(parent, 'text_exposed'); Arbiter.inform('reflow'); }; func(event); "><span class="see_more_link_inner">See more</span></a></span></span></div>`;
  return postBody;
}

// appends a post in feed
fbDevInterest.showPost = function(entry, group) {
  if (!entry.message) return;
  const matchedKeywords = this.findMatchedKeywords(entry.message);
  if (matchedKeywords.length === 0) return;
  if (this._highlightMatches) entry.message = this.highlightMatches(entry.message, matchedKeywords);
  entry.message = entry.message.replace(/\n/g, "</p><p>").linkify();

  if (entry.link && !entry.full_picture) {
    entry.message = `${entry.message} </p><p>[<b>LINK:</b> <a href="${entry.link}" target="_blank">${entry.link}</a>]`;
  }
  entry.message = this.splitPostBody(entry.message);
  const created_time = new Date(entry.created_time);

  const image = (entry.full_picture && !entry.full_picture.includes('//external.'))
    ? `<div class="_3x-2"><div><div class="mtm"><div><a class="_4-eo _2t9n _50z9" ajaxify="${entry.link}&player_origin=groups" data-ploi="${entry.full_picture}&player_origin=groups" href="${entry.link}" data-render-location="group"><div class="uiScaledImageContainer _517g"><img class="scaledImageFitWidth img" src="${entry.full_picture}"></div></a></div></div></div></div>`
    : '';

  const basePost = `
    <div class="_3ccb">
      <div></div>
      <div class="_5pcr userContentWrapper">
        <div class="_1dwg _1w_m _q7o">
          <h5 class="_5pbw fwb">
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

  const placeholder = document.querySelector('._3-u2.mbm._2iwp._4-u8')
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
  this.clearBlacklist();
  this.getGroupId = this.getGroupId();
  this.clearPosts();
  for (let i = 0; i < 5; ++i) this.parent.appendChild(this.createPlaceholder());
  scrollToItem(this.parent);
  this.getGroupFeed({ groupId: this.getGroupId.next().value });
};

fbDevInterest.showPostsOnScroll = function() {
  const self = this;
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
