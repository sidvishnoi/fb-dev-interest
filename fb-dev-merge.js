var ALL_GROUPS = [1378294582253698,249598592040574,2224932161064321,1924443867832338,1922538421363451,1920036621597031,1903916609822504,1841081392797911,1806620552895262,1780072415645281,1741843536047014,1724152667880378,1607133026028061,1494181493938081,1443394385967980,1258355007573190,1152576018114322,1148469218498930,1075017422642967,1074858042611323,1071045349642536,1041205739348709,893652180764182,886528924818522,886251554842166,885490321621308,854314664699156,826341790867138,813879575430133,811281355669013,793016410839401,786453984830109,638854212931776,499881580381233,485698195138488,476463749198108,428973767504677,402137910152010,362906487478469,348458995586076,332006040559709,313087542449350,309450039518404,304477986647756,293458267749614,265793323822652,199036970608482,187217085094857,186924858495604,160941794378470,152127978670639,132580147377707,125327974795168,111858152705945]; // all public groups

var fbfeed_placeholder_story = `<div class="_2iwo" data-testid="fbfeed_placeholder_story"><div class="_2iwq" id="u_0_63"><div class="_1enb"></div><div class="_2iwr"></div><div class="_2iws"></div><div class="_2iwt"></div><div class="_2iwu"></div><div class="_2iwv"></div><div class="_2iww"></div><div class="_2iwx"></div><div class="_2iwy"></div><div class="_2iwz"></div><div class="_2iw-"></div><div class="_2iw_"></div><div class="_2ix0"></div></div></div>`;

var fbDevMerge = fbDevMerge || {
  BASE_API_URL: `https://graph.facebook.com/v2.11/GROUPID/?&access_token=${FB_DEV_MERGE_API_KEY}&fields=name,feed.since(SINCE){message,updated_time,created_time,id,name,from},id,updated_time`,

  getGroupId: (function *() {
    let i = -1;
    while (true) {
      yield this.ALL_GROUPS[++i];
    };
  })(),

  parent: document.querySelector('#pagelet_group_pager'),

  showPost: function(entry, group) {
    console.log(entry);
    if (!entry.message) return;
    entry.message = entry.message.replace(/\n/g, "<br />");
    const created_time = new Date(entry.created_time);

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
            <div class="_5pcp _5lel _232_"><span class="_5paw _14zs"><a class="_3e_2 _14zr" href="#"></a></span><span role="presentation" aria-hidden="true"> · </span><span class="fsm fwn fcg"><a class="_5pcq" href="${entry.permalink}" target="_blank"><abbr title="${created_time.format('dddd, d MMMM yyyy at HH:mm')}" class="_5ptz"><span class="timestampContent">${created_time.format('d MMMM at HH:mm')}</span></abbr>
              </a>
              </span>
            </div>
            <div class="_5pbx userContent _22jv _3576">
              <p>${entry.message}</p>
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
  },

  // gets feed json
  getGroupFeed: function(options) {
    let fetchUrl = this.BASE_API_URL
      .replace('GROUPID', options.groupId)
    // const updated_time = localStorage.getItem(options.groupId);
    // if (updated_time) {
    //   const since = new Date(updated_time).valueOf() / 1000;
    //   fetchUrl = fetchUrl.replace('SINCE', since);
    // }
    fetchUrl = fetchUrl.replace('.since(SINCE)', '');

    fetch(fetchUrl)
      .then((res) => res.json())
      .then(json => {
        console.log(json.updated_time, json)
        for (const entry of json.feed.data) {
          this.showPost(entry, { name: json.name, id: json.id });
        }
        // localStorage.setItem(options.groupId, json.updated_time);
      })
      .catch(console.error);
  },

  clearPosts: function() {
    const removeElements = (elms) => Array.from(elms).forEach(el => el.remove());
    removeElements(document.querySelectorAll('._4mrt._5jmm._5pat._5v3q._4-u8')); // posts
    removeElements(document.querySelectorAll('._5umn')); // pinned post labels etc
    removeElements(document.querySelectorAll('_4wcq')); // recent acitivity label etc

    // XXX: prevent infinite scroll
    window.addEventListener('scroll', (e) => e.stopPropagation(), true);
  },

  getFeed: function() {
    this.clearPosts();
    const placeholder = document.createElement('div');
    placeholder.classList.add(...'_4-u2 mbm _2iwp _4-u8'.split(' '));
    placeholder.innerHTML = fbfeed_placeholder_story;
    for (let i = 0; i < 5; ++i) this.parent.appendChild(placeholder);
    this.getGroupFeed({ groupId: this.getGroupId.next().value });
  },
};

console.log('<<< fbDevMerge >>>');
fbDevMerge.parent.innerHTML = '';
fbDevMerge.getFeed();
