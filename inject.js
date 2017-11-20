// remove blacklisted groups
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


fbDevInterest.showComments = function(json, parent) {
  const self = this;
  const addComment = function (e, p) {
    const created_time = new Date(e.created_time);
    const commentHtml = `
      <div class="_3b-9">
        <div>
          <div direction="left" class="clearfix">
            <div class="_ohe lfloat"><a target="_blank" href="https://www.facebook.com/${e.from.id}" class="img _8o _8s UFIImageBlockImage" tabindex="-1" aria-hidden="true"><img alt="${e.from.name}" class="img UFIActorImage _54ru img" src="https://graph.facebook.com/${e.from.id}/picture?&access_token=${self._apiKey}&type=normal"></a></div>
            <div class="">
              <div class="UFIImageBlockContent _42ef">
                <div class="UFICommentContentBlock">
                  <div class="UFICommentContent">
                    <span class="UFICommentActorAndBody">
                      <span class=""><a class=" UFICommentActorName" target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a></span>
                      <span class="UFICommentBody"><span>${e.message.linkify()}</span></span>
                    </span>
                    <div class="fsm fwn fcg UFICommentActions"><span class="_6a _3-me">
                    </span><a class="uiLinkSubtle" href="${e.permalink_url}" target="_blank"><abbr class="livetimestamp" title="${created_time.format('dddd, d MMMM yyyy at hh:mm')}" data-shorten="true">${created_time.format('d MMMM at HH:mm')}</abbr></a></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const comment = document.createElement('div');
    comment.classList.add(...'UFIRow _48ph _48pi UFIComment _4oep'.split(' '));
    comment.style.borderTop = 'none';
    comment.innerHTML = commentHtml;
    p.appendChild(comment);
    return comment;
  }
  const addReply = function (e, p) {
    const created_time = new Date(e.created_time);
    const replyHtml = `
      <div class="_3b-9">
        <div>
          <div direction="left" class="clearfix">
            <div class="_ohe lfloat">
              <a target="_blank" href="https://www.facebook.com/${e.from.id}" class="img _8o _8s UFIImageBlockImage" tabindex="-1" aria-hidden="true"><img alt="${e.from.name}" class="img UFIActorImage _54ru img" src="https://graph.facebook.com/${e.from.id}/picture?&access_token=${self._apiKey}&type=normal"></a>
            </div>
            <div class="">
              <div class="UFIImageBlockContent _42ef">
                <div class="UFICommentContentBlock">
                  <div class="UFICommentContent">
                    <span class="UFICommentActorAndBody">
                      <span class=""><a class=" UFICommentActorName" target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a></span>
                      <span class="UFICommentBody"><span>${e.message.linkify()}</span></span>
                    </span>
                    <div class="fsm fwn fcg UFICommentActions"><span class="_6a _3-me">
                    </span><a class="uiLinkSubtle" href="${e.permalink_url}" target="_blank"><abbr class="livetimestamp" title="${created_time.format('dddd, d MMMM yyyy at hh:mm')}" data-shorten="true">${created_time.format('d MMMM at HH:mm')}</abbr></a></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const reply = document.createElement('div');
    reply.classList.add(...'UFIRow _48ph _48pi _4204 UFIComment _4oep'.split(' '));
    reply.style.borderLeftWidth = '2px';
    reply.innerHTML = replyHtml;
    p.appendChild(reply);
    return reply;
  }
  document.getElementById(`comment_trigger_${json.id}`).innerHTML = 'View all comments'
  if (!json.comments) {
    document.getElementById(`comment_trigger_${json.id}`).innerHTML = 'No comments yet.'
    return;
  };
  for (const $comment of json.comments.data) {
    const comment = addComment($comment, parent);
    const replyList = document.createElement('div');
    replyList.classList.add('UFIReplyList');
    parent.appendChild(replyList);
    if (!$comment.comments) continue;
    for (const $reply of $comment.comments.data) {
      const reply = addReply($reply, replyList)
    }
  }
}

fbDevInterest.getComments = function(postid, parent) {
  const createCommentArea = function(pid, p) {
    const html = `
      <div class="UFIRow UFIPagerRow _4oep _48pi _4204">
        <div direction="right" class="clearfix">
          <div class="_ohf rfloat"></div>
          <div class=""><a class="UFIPagerLink" id="comment_trigger_${pid}" target="_blank" href="https://facebook.com/${pid}" role="button">View all comments</a></div>
        </div>
      </div>
    `;

    const commentsArea = document.createElement('form');
    commentsArea.classList.add('commentable_item');
    p.appendChild(commentsArea);

    const c0 = document.createElement('div');
    c0.classList.add(...'uiUfi UFIContainer _5pc9 _5vsj _5v9k'.split(' '));
    commentsArea.appendChild(c0);

    const c1 = document.createElement('div');
    c1.classList.add('UFIList');
    c1.innerHTML = `<h6 class="accessible_elem">Comments</h6>`;
    c0.appendChild(c1);

    const c2 = document.createElement('div');
    c2.classList.add(...'_3b-9 _j6a'.split(' '));
    c1.appendChild(c2);

    const c3 = document.createElement('div');
    c3.innerHTML = html;
    c2.appendChild(c3);

    document.getElementById(`comment_trigger_${postid}`).innerHTML = `View all comments <span class="mls img _55ym _55yn _55yo" role="progressbar" aria-valuetext="Loading..." aria-busy="true" aria-valuemin="0" aria-valuemax="100"></span>`;

    return c3;
  }
  const commentsArea = createCommentArea(postid, parent);

  const fetchUrl = `https://graph.facebook.com/v2.11/${postid}/?&access_token=${fbDevInterest._apiKey}&fields=comments{from,permalink_url,message,created_time,comments{from,permalink_url,message,created_time}},permalink_url`;
  fetch(fetchUrl)
    .then(res => res.json())
    .then(json => this.showComments(json, commentsArea))
    .catch((error) => document.getElementById(`comment_trigger_${postid}`).innerHTML = `Try again`);
}


fbDevInterest.showPostButtons = function(entry, parent) {
  const self = this;

  const el = document.createElement('div');
  el.classList.add(...'_sa_ _gsd _fgm _5vsi _192z'.split(' '));
  const el1 = document.createElement('div');
  el.classList.add('_37uu');
  el.appendChild(el1);

  const el2 = document.createElement('div');
  el1.appendChild(el2);

  const el3 = document.createElement('div');
  el3.classList.add('_57w');
  el2.appendChild(el3);

  const el4 = document.createElement('div');
  el4.classList.add(...'_3399 _a7s _20h6 _610i _125r clearfix _zw3'.split(' '));
  el3.appendChild(el4);

  const el5 = document.createElement('div');
  el5.classList.add('_524d');
  el4.appendChild(el5);

  const el6 = document.createElement('div');
  el6.classList.add('_42nr');
  el5.appendChild(el6);

  const likeButton_1 = document.createElement('span');
  likeButton_1.classList.add('_1mto');
  el6.appendChild(likeButton_1);

  const likeButton_2 = document.createElement('div');
  likeButton_2.classList.add(...'_khz _4sz1'.split(' '));
  likeButton_1.appendChild(likeButton_2);

  const likeButton_3 = document.createElement('a');
  likeButton_3.classList.add(...'UFILikeLink _4x9- _4x9_ _48-k'.split(' '));
  likeButton_3.href = entry.permalink_url;
  likeButton_3.setAttribute('target', '_blank');
  likeButton_3.innerText = 'Like';
  likeButton_2.appendChild(likeButton_3);


  const commentButton_1 = document.createElement('span');
  commentButton_1.classList.add('_1mto');
  el6.appendChild(commentButton_1);

  const commentButton_2 = document.createElement('div');
  commentButton_2.classList.add(...'_6a _15-7 _3h-u'.split(' '));
  commentButton_1.appendChild(commentButton_2);

  const commentButton_3 = document.createElement('a');
  commentButton_3.classList.add(...'comment_link _5yxe'.split(' '));
  commentButton_3.href = '#';
  commentButton_3.setAttribute('role', 'button');
  commentButton_3.innerText = 'Comment';
  function _showComments() {
    self.getComments(entry.id, parent);
    this.removeEventListener('click', _showComments);
  }
  commentButton_3.addEventListener('click', _showComments);
  commentButton_2.appendChild(commentButton_3);

  const shareButton_1 = document.createElement('span');
  shareButton_1.classList.add('_1mto');
  el6.appendChild(shareButton_1);

  const shareButton_2 = document.createElement('div');
  shareButton_2.classList.add('_27de');
  shareButton_1.appendChild(shareButton_2);

  const shareButton_3 = document.createElement('a');
  shareButton_3.classList.add(...'share_action_link _5f9b'.split(' '));
  shareButton_3.href = entry.permalink_url;
  shareButton_3.setAttribute('target', '_blank');
  shareButton_3.innerText = 'Share';
  shareButton_2.appendChild(shareButton_3);

  parent.appendChild(el);
  return el;
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
            <a target="_blank" href="https://www.facebook.com/${entry.from.id}">${entry.from.name}</a>
    ‎         ▶
            <a target="_blank" href="https://www.facebook.com/${group.id}">${group.name}</a>
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
  this.showPostButtons(entry, p);
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
          throw new Error(`failed to fetch: ${fetchUrl}`);
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
      console.error(err);
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
