// util to create elements
fbDevInterest.createElement = function(type, options) {
  const el = document.createElement(type);
  if (options.classList) el.classList.add(...options.classList.split(' '));
  if (options.attrs) {
    for (const attr in options.attrs) {
      el.setAttribute(attr, options.attrs[attr]);
    }
  }
  if (options.innerHTML) el.innerHTML = options.innerHTML;
  if (options.events) {
    for (const event in options.events) {
      el.addEventListener(event, options.events[event]);
    }
  }
  if (options.parent) options.parent.appendChild(el);
  return el;
}

// clears localStorage of extension in case of out of quota
fbDevInterest.clearLocalStorage = function() {
  const keys = Object.keys(localStorage);
  let count = 0;
  for (const key of keys) {
    if (key.startsWith('https://graph.facebook.com/v2.11/')) {
      localStorage.removeItem(key);
      ++count;
    }
    if (count === 10) return; // let's delete just 10 items for now
  }
};

fbDevInterest.BASE_API_URL = `https://graph.facebook.com/v2.11/GROUPID/?&access_token=${fbDevInterest._apiKey}&fields=name,id,feed{message,id,name,from,permalink_url,full_picture,link,created_time}`;
fbDevInterest.COMMENTS_API_URL = `https://graph.facebook.com/v2.11/POSTID/?&access_token=${fbDevInterest._apiKey}&fields=comments{from,permalink_url,message,created_time,comments{from,permalink_url,message,created_time}},permalink_url`

// remove blacklisted groups from ALL_GROUPS
fbDevInterest.clearBlacklist = function() {
  for (const groupId of this._blacklist) {
    const idx = this.ALL_GROUPS.indexOf(parseInt(groupId, 10));
    if (idx > -1) this.ALL_GROUPS.splice(idx, 1);
  }

  // prioritize the group user is presently on
  try {
    let activeGroupId = document
      .querySelector('meta[property=\'al:ios:url\']')
      .content
      .match(/id=(\d*)/)[1];
    activeGroupId = parseInt(activeGroupId, 10);
    // remove from ALL_GROUPS
    const idx = this.ALL_GROUPS.indexOf(activeGroupId);
    if (idx > -1) this.ALL_GROUPS.splice(idx, 1);
    // add to front of ALL_GROUPS
    this.ALL_GROUPS.unshift(activeGroupId);
  } catch (e) {
    // do nothing
  }
}

// creates a placeholder post
fbDevInterest.createPlaceholder = function() {
  const fbfeed_placeholder_story = `<div class="_2iwo _3f3l" data-testid="fbfeed_placeholder_story"><div class="_2iwq"><div class="_1enb"></div><div class="_2iwr"></div><div class="_2iws"></div><div class="_2iwt"></div><div class="_2iwu"></div><div class="_2iwv"></div><div class="_2iww"></div><div class="_2iwx"></div><div class="_2iwy"></div><div class="_2iwz"></div><div class="_2iw-"></div><div class="_2iw_"></div><div class="_2ix0"></div></div></div>`;
  return this.createElement('div', {
    classList: '_3-u2 mbm _2iwp _4-u8',
    innerHTML: fbfeed_placeholder_story,
    parent: this.parent,
  });
};

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
fbDevInterest.requestList = new Set();

// find matching keywords in post body
fbDevInterest.findMatchedKeywords = function(content) {
  if (this._keywords.size === 0) return [[0, 0]];
  const $content = content.toLowerCase();
  const matches = [];
  for (const keyword of this._keywords) {
    const re = new RegExp(`(?:^|\\b)(${keyword.replace(/\s\s+/g, '\\s*').replace(/\./g, '\\.?')})(?=\\b|$)`);
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

fbDevInterest.showComments = function(json, parent) {
  const self = this;

  const getMessageHtml = function(e) {
    const created_time = new Date(e.created_time);
    return `
      <div class="_3b-9">
        <div>
          <div direction="left" class="clearfix">
            <div class="_ohe lfloat"><a target="_blank" href="https://www.facebook.com/${e.from.id}" class="img _8o _8s UFIImageBlockImage" tabindex="-1" aria-hidden="true"><img alt="${e.from.name}" class="img UFIActorImage _54ru img" src="https://graph.facebook.com/${e.from.id}/picture?&access_token=${self._apiKey}&type=normal"></a></div>
            <div class="">
              <div class="UFIImageBlockContent _42ef">
                <div class="UFICommentContentBlock">
                  <div class="UFICommentContent">
                    <span class="UFICommentActorAndBody">
                      <span class="">
                        <a class=" UFICommentActorName" target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a>
                      </span>
                      <span class="UFICommentBody"><span>${e.message.linkify()}</span></span>
                    </span>
                    <div class="fsm fwn fcg UFICommentActions"><span class="_6a _3-me"></span>
                      <a class="uiLinkSubtle" href="${e.permalink_url}" target="_blank">
                        <abbr class="livetimestamp" title="${created_time.format('dddd, d MMMM yyyy at hh:mm')}" data-shorten="true">${created_time.format('d MMMM at HH:mm')}</abbr>
                      </a>
                      <!-- </span> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const addComment = function (e, p) {
    const comment = self.createElement('div', {
      classList: 'UFIRow _48ph _48pi UFIComment _4oep',
      parent: p,
      innerHTML: getMessageHtml(e),
      attrs: { style: 'border-top: none' },
    });
    return comment;
  }

  const addReply = function (e, p) {
    const reply = self.createElement('div', {
      classList: 'UFIRow _48ph _48pi _4204 UFIComment _4oep',
      parent: p,
      innerHTML: getMessageHtml(e),
      attrs: { style: 'border-left-width: 2px' },
    });
    return reply;
  }

  const commentsTrigger = document.getElementById(`comment_trigger_${json.id}`);
  commentsTrigger.innerHTML = 'View all comments'
  if (!json.comments) {
    commentsTrigger.innerHTML = 'No comments yet.'
    return;
  };

  for (const $comment of json.comments.data) {
    const comment = addComment($comment, parent);
    if (!$comment.comments) continue;
    const replyList = self.createElement('div', { classList: 'UFIReplyList', parent: parent });
    for (const $reply of $comment.comments.data) {
      const reply = addReply($reply, replyList);
    }
  }
}

// gets comments for a post and shows them
fbDevInterest.getComments = function(postid, parent) {
  const self = this;
  const createCommentArea = function(pid, p) {
    const html = `
      <div class="UFIRow UFIPagerRow _4oep _48pi _4204">
        <div direction="right" class="clearfix">
          <div class="_ohf rfloat"></div>
          <div class=""><a class="UFIPagerLink" id="comment_trigger_${pid}" target="_blank" href="https://facebook.com/${pid}" role="button">View all comments</a></div>
        </div>
      </div>
    `;
    const c = self.createElement('div', {
      innerHTML: html,
      parent: self.createElement('div', {
        classList: '_3b-9 _j6a',
        parent: self.createElement('div', {
          classList: 'UFIList',
          innerHTML: `<h6 class="accessible_elem">Comments</h6>`,
          parent: self.createElement('div', {
            classList: 'uiUfi UFIContainer _5pc9 _5vsj _5v9k',
            parent: self.createElement('form', {
              classList: 'commentable_item',
              parent: p,
            }),
          }),
        }),
      }),
    });

    document.getElementById(`comment_trigger_${postid}`).innerHTML = `View all comments <span class="mls img _55ym _55yn _55yo" role="progressbar" aria-valuetext="Loading..." aria-busy="true" aria-valuemin="0" aria-valuemax="100"></span>`;

    return c;
  }
  const commentsArea = createCommentArea(postid, parent);

  const fetchUrl = self.COMMENTS_API_URL.replace('POSTID', postid);

  let cachedResult = localStorage.getItem(fetchUrl);
  if (cachedResult) {
    cachedResult = JSON.parse(cachedResult);
    const minuteDiff = (new Date() - new Date(cachedResult.last_fetch_time)) / (1000*60);
    if (minuteDiff < 10) { // 10 min cache
      return handleJsonResponse(cachedResult);
    }
  }

  self.requestList.add(fetchUrl);
  fetch(fetchUrl)
    .then(res => res.json())
    .then((json) => {
      json.last_fetch_time = new Date();
      try {
        localStorage.setItem(fetchUrl, JSON.stringify(json));
      } catch (e) {
        // out of storage? don't store and clear items for extension
        self.clearLocalStorage();
      }
      self.requestList.delete(fetchUrl);
      self.showComments(json, commentsArea);
    })
    .catch((err) => {
      console.error(err);
      self.requestList.delete(fetchUrl);
      document.getElementById(`comment_trigger_${postid}`).innerHTML = `Some error occured. Try again?`;
    });
}

// shows like, comment and share buttons for a post
fbDevInterest.showPostButtons = function(entry, parent) {
  const self = this;
  function _showComments() {
    self.getComments(entry.id, parent);
    this.removeEventListener('click', _showComments);
  }

  const el = self.createElement('div', {
    classList: '_sa_ _gsd _fgm _5vsi _192z',
    parent: parent,
  });

  const el6 = self.createElement('div', {
    classList: '_42nr',
    parent: self.createElement('div', {
      classList: '_524d',
      parent: self.createElement('div', {
        classList: '_3399 _a7s _20h6 _610i _125r clearfix _zw3',
        parent: self.createElement('div', {
          classList: '_57w',
          parent: self.createElement('div', {
            parent: self.createElement('div', {
              classList: '_37uu',
              parent: el,
            }),
          }),
        }),
      }),
    }),
  });

  const likeButton = self.createElement('a', {
    classList: 'UFILikeLink _4x9- _4x9_ _48-k',
    innerHTML: 'Like',
    attrs: {
      href: entry.permalink_url,
      target: '_blank',
    },
    parent: self.createElement('div', {
      classList: '_khz _4sz1',
      parent: self.createElement('span', {
        classList: '_1mto',
        parent: el6,
      }),
    }),
  });

  const commentButton = self.createElement('a', {
    classList: 'comment_link _5yxe',
    innerHTML: 'Comment',
    attrs: {
      href: '#',
      role: 'button',
    },
    events: {
      click: _showComments,
    },
    parent: self.createElement('div', {
      classList: '_6a _15-7 _3h-u',
      parent: self.createElement('span', {
        classList: '_1mto',
        parent: el6,
      }),
    }),
  });

  const shareButton = self.createElement('a', {
    classList: 'share_action_link _5f9b',
    innerHTML: 'Share',
    attrs: {
      href: entry.permalink_url,
      target: '_blank',
    },
    parent: self.createElement('div', {
      classList: '_27de',
      parent: self.createElement('span', {
        classList: '_1mto',
        parent: el6,
      }),
    }),
  });

  return el;
}

// appends a post in feed
fbDevInterest.showPost = function(post) {
  const placeholder = document.querySelector('._3-u2.mbm._2iwp._4-u8')
  if (placeholder) this.parent.replaceChild(post, placeholder)
  else this.parent.appendChild(post);
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

// creates a post
fbDevInterest.createPost = function(entry, group) {
  const self = this;
  if (!entry.message) return;

  const matchedKeywords = self.findMatchedKeywords(entry.message);
  if (matchedKeywords.length === 0) return;

  const getBodyHTML = function(e, grp) {
    let message = e.message;
    if (self._highlightMatches) message = self.highlightMatches(message, matchedKeywords);
    message = message.replace(/\n/g, "</p><p>").linkify();

    if (e.link && e.full_picture && e.full_picture.includes('//external.')) {
      message = `${message} </p><p>[<b>LINK:</b> <a href="${e.link}" target="_blank">${e.link}</a>]`;
    }
    message = self.splitPostBody(message);

    const created_time = new Date(e.created_time);

    const image = (e.full_picture && !e.full_picture.includes('//external.'))
      ? `<div class="_3x-2"><div><div class="mtm"><div><a class="_4-eo _2t9n _50z9" ajaxify="${e.link}&player_origin=groups" data-ploi="${e.full_picture}&player_origin=groups" href="${e.link}" data-render-location="group"><div class="uiScaledImageContainer _517g"><img class="scaledImageFitWidth img" src="${e.full_picture}"></div></a></div></div></div></div>`
      : '';

    const html = `
      <div class="_3ccb">
        <div></div>
        <div class="_5pcr userContentWrapper">
          <div class="_1dwg _1w_m _q7o">
            <h5 class="_5pbw fwb">
              <a target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a>
      ‎         ▶
              <a target="_blank" href="https://www.facebook.com/${grp.id}">${grp.name}</a>
            </h5>
            <div class="_5pcp _5lel _232_"><span class="_5paw _14zs"><a class="_3e_2 _14zr" href="#"></a></span><span role="presentation" aria-hidden="true"> · </span><span class="fsm fwn fcg"><a class="_5pcq" href="${e.permalink_url}" target="_blank"><abbr title="${created_time.format('dddd, d MMMM yyyy at HH:mm')}" class="_5ptz"><span class="timestampContent">${created_time.format('d MMMM at HH:mm')}</span></abbr>
              </a>
              </span>
            </div>
            <div class="_5pbx userContent _22jv _3576">
              <p>${message}</p>
              ${image}
            </div>
            <div></div>
          </div>
        </div>
      </div>
      `;
    return html;
  };

  const p = self.createElement('div', {
    classList: '_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8',
    innerHTML: getBodyHTML(entry, group),
    attrs: { id: `mall_post_${entry.id}:6:0` }
  });

  self.showPost(p);
  self.showPostButtons(entry, p);
};

// gets feed json and shows posts
fbDevInterest.getGroupFeed = function(options) {
  const self = this;
  let fetchUrl = self.BASE_API_URL.replace('GROUPID', options.groupId)
  const state = self.state[options.groupId];
  if (state && state.nextPageUrl) {
    fetchUrl = state.nextPageUrl;
  }
  if (fetchUrl === 'False') return;

  function handleJsonResponse(json) {
    if (json.error) throw json.error;
    if (!json.feed) {
      if (Array.isArray(json.data)) {
        json.feed = {
          data: json.data,
          paging: json.paging,
        };
      } else {
        throw new Error(`failed to fetch: ${fetchUrl}`);
      }
    }
    self.state[options.groupId] = self.state[options.groupId] || { name: json.name };
    try {
      self.state[options.groupId].nextPageUrl = json.feed.paging.next;
    } catch (err) {
      // no more posts, remove group from list
      const idx = self.ALL_GROUPS.indexOf(options.groupId);
      self.ALL_GROUPS.splice(idx, 1);
      self.state[options.groupId].nextPageUrl = 'False';
    }
    for (const entry of json.feed.data) {
      try {
        self.createPost(entry, { name: self.state[options.groupId].name, id: options.groupId });
      } catch (err) {
        console.error(err);
      }
    }
    self.getPostsOnScroll();
  }

  function handleJsonError(err) {
    console.error(err);
    const errorPost = self.createElement('div', {
      classList: '_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8',
      innerHTML: `<div class="_3ccb"><div class="_5pcr userContentWrapper"><div class="_1dwg _1w_m _q7o"><div class="_5pbx userContent _22jv _3576"><pre>${JSON.stringify(err, null, 2)}</pre></div></div></div></div>`,
      attrs: { style: 'color: red;' },
    });
    self.showPost(errorPost);
  }

  let cachedResult = localStorage.getItem(fetchUrl);
  if (cachedResult) {
    cachedResult = JSON.parse(cachedResult);
    const minuteDiff = (new Date() - new Date(cachedResult.last_fetch_time)) / (1000*60);
    if (minuteDiff < 10) { // 10 min cache
      return handleJsonResponse(cachedResult);
    }
  }

  self.requestList.add(fetchUrl);
  fetch(fetchUrl)
    .then((res) => res.json())
    .then((json) => {
      json.last_fetch_time = new Date();
      try {
        localStorage.setItem(fetchUrl, JSON.stringify(json));
      } catch(e) {
        // out of storage? don't store and clear items for extension
        self.clearLocalStorage();
      }
      self.requestList.delete(fetchUrl);
      handleJsonResponse(json);
    })
    .catch((err) => {
      self.requestList.delete(fetchUrl);
      handleJsonError(err);
    });
};

// gets more posts on scroll (replacement of fb's infinite scroll)
fbDevInterest.getPostsOnScroll = function() {
  const self = this;
  const a = document.querySelectorAll('._4mrt._5jmm._5pat._5v3q._4-u8');
  const last = a[a.length -1 ];
  const onVisible = function(e) {
    const groupId = self.getGroupId.next().value;
    if (!groupId) {
      fbDevInterest.nomore = true;
      console.log('No more posts in criteria');
      window.removeEventListener('scroll', onVisible, true);
      return;
    };
    if (self.requestList.size > 10) return;
    if (!last) {
      return self.getGroupFeed({ groupId }); // when no post in feed yet
    }
    if (isScrolledIntoView(last)) {
      window.removeEventListener('scroll', onVisible, true);
      if (document.querySelectorAll('._3-u2.mbm._2iwp._4-u8').length < 3) {
        for (let i = 0; i < 5; ++i) self.createPlaceholder();
      }
      self.getGroupFeed({ groupId });
    }
  };
  if (!fbDevInterest.nomore) window.addEventListener('scroll', onVisible, true);
}

// clears feed to show custom posts
fbDevInterest.clearPosts = function() {
  const removeElements = (elms) => Array.from(elms).forEach(el => el.remove());
  removeElements(document.querySelectorAll('._4mrt._5jmm._5pat._5v3q._4-u8')); // posts
  removeElements(document.querySelectorAll('._5umn')); // pinned post labels etc
  removeElements(document.querySelectorAll('._4wcq')); // recent activity label etc

  // XXX: prevent fb's infinite scroll
  window.addEventListener('scroll', (e) => e.stopPropagation(), true);
};

fbDevInterest.init = function() {
  this.clearBlacklist();
  this.clearPosts();
  this.getGroupId = this.getGroupId();
  for (let i = 0; i < 5; ++i) this.createPlaceholder();
  scrollToItem(this.parent); // smooth scroll to feed start (from utils.js)
  this.getGroupFeed({ groupId: this.getGroupId.next().value });
};
