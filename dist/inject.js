fbDevInterest.createElement=function(e,t){const n=document.createElement(e);if(t.classList&&n.classList.add(...t.classList.split(" ")),t.attrs)for(const e in t.attrs)n.setAttribute(e,t.attrs[e]);if(t.innerHTML&&(n.innerHTML=t.innerHTML),t.events)for(const e in t.events)n.addEventListener(e,t.events[e]);return t.parent&&t.parent.appendChild(n),n},fbDevInterest.BASE_API_URL=`https://graph.facebook.com/v2.11/GROUPID/?&access_token=${fbDevInterest._apiKey}&fields=name,id,feed{message,id,name,from,permalink_url,full_picture,link,created_time}`,fbDevInterest.COMMENTS_API_URL=`https://graph.facebook.com/v2.11/POSTID/?&access_token=${fbDevInterest._apiKey}&fields=comments{from,permalink_url,message,created_time,comments{from,permalink_url,message,created_time}},permalink_url`,fbDevInterest.clearBlacklist=function(){for(const e of this._blacklist){const t=this.ALL_GROUPS.indexOf(parseInt(e,10));t>-1&&this.ALL_GROUPS.splice(t,1)}try{let e=document.querySelector("meta[property='al:ios:url']").content.match(/id=(\d*)/)[1];e=parseInt(e,10);const t=this.ALL_GROUPS.indexOf(e);t>-1&&this.ALL_GROUPS.splice(t,1),this.ALL_GROUPS.unshift(e)}catch(e){}},fbDevInterest.createPlaceholder=function(){return this.createElement("div",{classList:"_3-u2 mbm _2iwp _4-u8",innerHTML:'<div class="_2iwo _3f3l" data-testid="fbfeed_placeholder_story"><div class="_2iwq"><div class="_1enb"></div><div class="_2iwr"></div><div class="_2iws"></div><div class="_2iwt"></div><div class="_2iwu"></div><div class="_2iwv"></div><div class="_2iww"></div><div class="_2iwx"></div><div class="_2iwy"></div><div class="_2iwz"></div><div class="_2iw-"></div><div class="_2iw_"></div><div class="_2ix0"></div></div></div>',parent:this.parent})},fbDevInterest.getGroupId={},fbDevInterest.getGroupId=function(){const e=this;let t=-1;return function*(){for(;;)yield e.ALL_GROUPS[++t%e.ALL_GROUPS.length]}()},fbDevInterest.parent=document.querySelector("#pagelet_group_mall"),fbDevInterest.state={},fbDevInterest.requestList=new Set,fbDevInterest.findMatchedKeywords=function(e){if(0===this._keywords.size)return[[0,0]];const t=e.toLowerCase(),n=[];for(const e of this._keywords){const s=new RegExp(`(?:^|\\b)(${e.replace(/\s\s+/g,"\\s*").replace(/\./g,"\\.?")})(?=\\b|$)`),a=t.match(s);a&&n.push([a.index,a[0].length])}return n.sort(function(e,t){return e[0]<t[0]?-1:e[0]>t[0]?1:e[1]<t[1]?1:e[1]>t[1]?-1:0})},fbDevInterest.highlightMatches=function(e,t){let n,s="",a=0;const r=new Set;for(let i=0;i<t.length;++i){n=0===i?0:t[i-1][0]+t[i-1][1];const[o,c]=t[i];r.has(o)?a=t[i-1][0]+t[i-1][1]:(r.add(o),s+=`${e.substring(0!==a?a:n,o)}<mark>${e.substring(o,o+c)}</mark>`,a=0)}const i=t[t.length-1];return s+=e.substring(i[0]+i[1])},fbDevInterest.showComments=function(e,t){const n=this,s=function(e){const t=new Date(e.created_time);return`\n      <div class="_3b-9">\n        <div>\n          <div direction="left" class="clearfix">\n            <div class="_ohe lfloat"><a target="_blank" href="https://www.facebook.com/${e.from.id}" class="img _8o _8s UFIImageBlockImage" tabindex="-1" aria-hidden="true"><img alt="${e.from.name}" class="img UFIActorImage _54ru img" src="https://graph.facebook.com/${e.from.id}/picture?&access_token=${n._apiKey}&type=normal"></a></div>\n            <div class="">\n              <div class="UFIImageBlockContent _42ef">\n                <div class="UFICommentContentBlock">\n                  <div class="UFICommentContent">\n                    <span class="UFICommentActorAndBody">\n                      <span class="">\n                        <a class=" UFICommentActorName" target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a>\n                      </span>\n                      <span class="UFICommentBody"><span>${e.message.linkify()}</span></span>\n                    </span>\n                    <div class="fsm fwn fcg UFICommentActions"><span class="_6a _3-me"></span>\n                      <a class="uiLinkSubtle" href="${e.permalink_url}" target="_blank">\n                        <abbr class="livetimestamp" title="${t.format("dddd, d MMMM yyyy at hh:mm")}" data-shorten="true">${t.format("d MMMM at HH:mm")}</abbr>\n                      </a>\n                      \x3c!-- </span> --\x3e\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    `},a=function(e,t){return n.createElement("div",{classList:"UFIRow _48ph _48pi UFIComment _4oep",parent:t,innerHTML:s(e),attrs:{style:"border-top: none"}})},r=function(e,t){return n.createElement("div",{classList:"UFIRow _48ph _48pi _4204 UFIComment _4oep",parent:t,innerHTML:s(e),attrs:{style:"border-left-width: 2px"}})},i=document.getElementById(`comment_trigger_${e.id}`);if(i.innerHTML="View all comments",e.comments)for(const s of e.comments.data){a(s,t);if(!s.comments)continue;const e=n.createElement("div",{classList:"UFIReplyList",parent:t});for(const t of s.comments.data){r(t,e)}}else i.innerHTML="No comments yet."},fbDevInterest.getComments=function(e,t){const n=this,s=function(t,s){const a=`\n      <div class="UFIRow UFIPagerRow _4oep _48pi _4204">\n        <div direction="right" class="clearfix">\n          <div class="_ohf rfloat"></div>\n          <div class=""><a class="UFIPagerLink" id="comment_trigger_${t}" target="_blank" href="https://facebook.com/${t}" role="button">View all comments</a></div>\n        </div>\n      </div>\n    `,r=n.createElement("div",{innerHTML:a,parent:n.createElement("div",{classList:"_3b-9 _j6a",parent:n.createElement("div",{classList:"UFIList",innerHTML:'<h6 class="accessible_elem">Comments</h6>',parent:n.createElement("div",{classList:"uiUfi UFIContainer _5pc9 _5vsj _5v9k",parent:n.createElement("form",{classList:"commentable_item",parent:s})})})})});return document.getElementById(`comment_trigger_${e}`).innerHTML='View all comments <span class="mls img _55ym _55yn _55yo" role="progressbar" aria-valuetext="Loading..." aria-busy="true" aria-valuemin="0" aria-valuemax="100"></span>',r}(e,t),a=n.COMMENTS_API_URL.replace("POSTID",e);let r=localStorage.getItem(a);if(r){r=JSON.parse(r);if((new Date-new Date(r.last_fetch_time))/6e4<10)return handleJsonResponse(r)}n.requestList.add(a),fetch(a).then(e=>e.json()).then(e=>{e.last_fetch_time=new Date,localStorage.setItem(a,JSON.stringify(e)),n.requestList.delete(a),n.showComments(e,s)}).catch(t=>{console.error(t),n.requestList.delete(a),document.getElementById(`comment_trigger_${e}`).innerHTML="Some error occured. Try again?"})},fbDevInterest.showPostButtons=function(e,t){function n(){s.getComments(e.id,t),this.removeEventListener("click",n)}const s=this,a=s.createElement("div",{classList:"_sa_ _gsd _fgm _5vsi _192z",parent:t}),r=s.createElement("div",{classList:"_42nr",parent:s.createElement("div",{classList:"_524d",parent:s.createElement("div",{classList:"_3399 _a7s _20h6 _610i _125r clearfix _zw3",parent:s.createElement("div",{classList:"_57w",parent:s.createElement("div",{parent:s.createElement("div",{classList:"_37uu",parent:a})})})})})});s.createElement("a",{classList:"UFILikeLink _4x9- _4x9_ _48-k",innerHTML:"Like",attrs:{href:e.permalink_url,target:"_blank"},parent:s.createElement("div",{classList:"_khz _4sz1",parent:s.createElement("span",{classList:"_1mto",parent:r})})}),s.createElement("a",{classList:"comment_link _5yxe",innerHTML:"Comment",attrs:{href:"#",role:"button"},events:{click:n},parent:s.createElement("div",{classList:"_6a _15-7 _3h-u",parent:s.createElement("span",{classList:"_1mto",parent:r})})}),s.createElement("a",{classList:"share_action_link _5f9b",innerHTML:"Share",attrs:{href:e.permalink_url,target:"_blank"},parent:s.createElement("div",{classList:"_27de",parent:s.createElement("span",{classList:"_1mto",parent:r})})});return a},fbDevInterest.showPost=function(e){const t=document.querySelector("._3-u2.mbm._2iwp._4-u8");t?this.parent.replaceChild(e,t):this.parent.appendChild(e)},fbDevInterest.splitPostBody=function(e){const t=e.split("</p>");if(t.length<6)return e;const n=t.slice(0,6).join("</p>"),s=t.slice(6).join("</p>"),a=Math.random().toString().replace(".","");return`<div id="id_${a}" class="text_exposed_root">${n}<span class="text_exposed_hide">...</span><div class="text_exposed_show">${s}</div><span class="text_exposed_hide"> <span class="text_exposed_link"><a class="see_more_link" onclick="var func = function(e) { e.preventDefault(); }; var parent = Parent.byClass(this, 'text_exposed_root'); if (parent && parent.getAttribute('id') == 'id_${a}') { CSS.addClass(parent, 'text_exposed'); Arbiter.inform('reflow'); }; func(event); "><span class="see_more_link_inner">See more</span></a></span></span></div>`},fbDevInterest.createPost=function(e,t){const n=this;if(!e.message)return;const s=n.findMatchedKeywords(e.message);if(0===s.length)return;const a=n.createElement("div",{classList:"_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8",innerHTML:function(e,t){let a=e.message;n._highlightMatches&&(a=n.highlightMatches(a,s)),a=a.replace(/\n/g,"</p><p>").linkify(),e.link&&e.full_picture&&e.full_picture.includes("//external.")&&(a=`${a} </p><p>[<b>LINK:</b> <a href="${e.link}" target="_blank">${e.link}</a>]`),a=n.splitPostBody(a);const r=new Date(e.created_time),i=e.full_picture&&!e.full_picture.includes("//external.")?`<div class="_3x-2"><div><div class="mtm"><div><a class="_4-eo _2t9n _50z9" ajaxify="${e.link}&player_origin=groups" data-ploi="${e.full_picture}&player_origin=groups" href="${e.link}" data-render-location="group"><div class="uiScaledImageContainer _517g"><img class="scaledImageFitWidth img" src="${e.full_picture}"></div></a></div></div></div></div>`:"";return`\n      <div class="_3ccb">\n        <div></div>\n        <div class="_5pcr userContentWrapper">\n          <div class="_1dwg _1w_m _q7o">\n            <h5 class="_5pbw fwb">\n              <a target="_blank" href="https://www.facebook.com/${e.from.id}">${e.from.name}</a>\n      ‎         ▶\n              <a target="_blank" href="https://www.facebook.com/${t.id}">${t.name}</a>\n            </h5>\n            <div class="_5pcp _5lel _232_"><span class="_5paw _14zs"><a class="_3e_2 _14zr" href="#"></a></span><span role="presentation" aria-hidden="true"> · </span><span class="fsm fwn fcg"><a class="_5pcq" href="${e.permalink_url}" target="_blank"><abbr title="${r.format("dddd, d MMMM yyyy at HH:mm")}" class="_5ptz"><span class="timestampContent">${r.format("d MMMM at HH:mm")}</span></abbr>\n              </a>\n              </span>\n            </div>\n            <div class="_5pbx userContent _22jv _3576">\n              <p>${a}</p>\n              ${i}\n            </div>\n            <div></div>\n          </div>\n        </div>\n      </div>\n      `}(e,t),attrs:{id:`mall_post_${e.id}:6:0`}});n.showPost(a),n.showPostButtons(e,a)},fbDevInterest.getGroupFeed=function(e){function t(t){if(t.error)throw t.error;if(!t.feed){if(!Array.isArray(t.data))throw new Error(`failed to fetch: ${s}`);t.feed={data:t.data,paging:t.paging}}n.state[e.groupId]=n.state[e.groupId]||{name:t.name};try{n.state[e.groupId].nextPageUrl=t.feed.paging.next}catch(t){const s=n.ALL_GROUPS.indexOf(e.groupId);n.ALL_GROUPS.splice(s,1),n.state[e.groupId].nextPageUrl="False"}for(const s of t.feed.data)try{n.createPost(s,{name:n.state[e.groupId].name,id:e.groupId})}catch(e){console.error(e)}n.getPostsOnScroll()}const n=this;let s=n.BASE_API_URL.replace("GROUPID",e.groupId);const a=n.state[e.groupId];if(a&&a.nextPageUrl&&(s=a.nextPageUrl),"False"===s)return;let r=localStorage.getItem(s);if(r){r=JSON.parse(r);if((new Date-new Date(r.last_fetch_time))/6e4<10)return t(r)}n.requestList.add(s),fetch(s).then(e=>e.json()).then(e=>{e.last_fetch_time=new Date,localStorage.setItem(s,JSON.stringify(e)),n.requestList.delete(s),t(e)}).catch(e=>{n.requestList.delete(s),function(e){console.error(e);const t=n.createElement("div",{classList:"_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8",innerHTML:`<div class="_3ccb"><div class="_5pcr userContentWrapper"><div class="_1dwg _1w_m _q7o"><div class="_5pbx userContent _22jv _3576"><pre>${JSON.stringify(e,null,2)}</pre></div></div></div></div>`,attrs:{style:"color: red;"}});n.showPost(t)}(e)})},fbDevInterest.getPostsOnScroll=function(){const e=this,t=document.querySelectorAll("._4mrt._5jmm._5pat._5v3q._4-u8"),n=t[t.length-1],s=function(t){const a=e.getGroupId.next().value;if(!a)return fbDevInterest.nomore=!0,console.log("No more posts in criteria"),void window.removeEventListener("scroll",s,!0);if(!(e.requestList.size>10)){if(!n)return e.getGroupFeed({groupId:a});if(isScrolledIntoView(n)){if(window.removeEventListener("scroll",s,!0),document.querySelectorAll("._3-u2.mbm._2iwp._4-u8").length<3)for(let t=0;t<5;++t)e.createPlaceholder();e.getGroupFeed({groupId:a})}}};fbDevInterest.nomore||window.addEventListener("scroll",s,!0)},fbDevInterest.clearPosts=function(){const e=e=>Array.from(e).forEach(e=>e.remove());e(document.querySelectorAll("._4mrt._5jmm._5pat._5v3q._4-u8")),e(document.querySelectorAll("._5umn")),e(document.querySelectorAll("._4wcq")),window.addEventListener("scroll",e=>e.stopPropagation(),!0)},fbDevInterest.init=function(){this.clearBlacklist(),this.clearPosts(),this.getGroupId=this.getGroupId();for(let e=0;e<5;++e)this.createPlaceholder();scrollToItem(this.parent),this.getGroupFeed({groupId:this.getGroupId.next().value})};