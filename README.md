# Merge Facebook Dev Circles by Interests

> A Chrome extension that filters through Facebook Dev Circles around the world to get only the interesting posts in your feed.

[![Merge Facebook Dev Circles by Interests](https://i.imgur.com/evnMkm8.jpg)](https://www.youtube.com/watch?v=yJPD3iW6ZvY)
*https://www.youtube.com/watch?v=yJPD3iW6ZvY*


## Vision

Instead of having dev circles according to locations, we can now have posts from various dev circles based on our interests.

## What is it?

It is a Google Chrome extension that replaces the feed of your Facebook Dev Circle group according to your interests.

## What does it do?

You put some keywords of your interest, say javascript, node.js, in the options of extension and when you run the extension on a Facebook group page (say your local Dev Circle), you get posts from various public dev circle groups which match your keywords, right into your feed.

So instead of having dev circles by region, you now have dev circles by your interests!

It has some pre-defined tags that help you add your keywords easily. You also have the option to blacklist certain groups, if you don't want to see posts from them (maybe due to language differences).

It uses the graph API to fetch feeds from various dev circle groups.

## [Download the extension (.crx)](https://github.com/sidvishnoi/fb-dev-interest/releases/download/v1.2/Merge.Facebook.Dev.Circles.by.Interests.crx)


# Screenshots

[![Showing posts from various public Facebook Dev Circle groups (based on keywords - node.js, react) in a Facebook Dev Circle group](https://i.imgur.com/4zV6eHj.png)](https://i.imgur.com/4zV6eHj.png)
*Showing posts from various public Facebook Dev Circle groups (based on keywords - `node.js, react`) in a Facebook Dev Circle group*

[![Options Page for extension, showing addition of keywords of user's interest](https://i.imgur.com/PnJvc6I.png)](https://i.imgur.com/PnJvc6I.png)
*Options Page for extension, showing addition of keywords of user's interest*

[![Comments on a post can also be viewed in the custom feed](https://i.imgur.com/Ttzscqy.png)](https://i.imgur.com/Ttzscqy.png)
*Comments on a post can also be viewed in the custom feed*


# How to Install

([Video - How to Install and configure](https://www.youtube.com/watch?v=A-LR6KWdAsM))

1. Download the extension (`Merge.Facebook.Dev.Circles.by.Interests.crx`) from link above or from [releases page](https://github.com/sidvishnoi/fb-dev-interest/releases).
2. Drag and Drop downloaded file into Google Chrome's Extensions page (`chrome://extensions/`).
3. Install the extension by clicking Install button.
4. Go to extension's options and configure.

# Configure

### App Token (required)

Get your app token from [https://developers.facebook.com/tools/accesstoken/](https://developers.facebook.com/tools/accesstoken/). You might need to create a Facebook Developer Account and/or a app. Create an app if not exists and get the `App Token` (not User Token) and paste in App Token field in extension's options page.

The App Token is needed to authenticate Facebook's Graph API requests.

### My Interests

Add the keywords that interest you in this field to filter posts. Type a keyword and press Enter to add it. Click a keyword to remove it. We've added some keywords as suggestions. You can contribute by adding more keywords :)

If you leave this field blank, you'll get all posts from all public dev circle groups.

### Highlight Keyword Matches

Enable to highlight matched keywords in posts, otherwise disable.

### Blacklist Groups

Add a group's name (and make use to auto-complete) to blacklist it (avoid showing posts from that group in your feed). You might want to blacklist a group as you might not be interested in their posts (no hate!) or not able to understand their language.

# How we built it?

The extension uses the **Graph API** to fetch feeds from various dev circle groups. The posts shown in feed have same CSS classes as of regular posts in feed. We did this to make the feed look as natural as possible.

The options page is written using the **React** framework. Used react components can be seen in GitHub repo.

## Challenges we ran into

1. Never built a Chrome extension before.
2. Never used Graph API, React before.
3. Finding the correct classes and minimal html for rendering posts in feed was quite a challenge.
4. @sidvishnoi (the coder) was sick during development process.
5. The other teammate (the one with original idea) was busy with out of station work.

# Proud moments

Making the posts and comments look similar to the ones shown in felt pretty cool. It seemed like I have finally built something.

@sidvishnoi learnt react and webpack in one day and made the options page (not a lot, but enough to make it work).

Creating a Chrome extension was also a fun thing to have done.

# Contributing

I would love your PRs. You can contribute :

- by adding more keyword suggestions (edit: [/options.dev/keywords.js](/options.dev/keywords.js)).
- letting me know of additions/removals of public Dev circle groups (edit: [/options.dev/groups.js](/options.dev/groups.js), you may use [/scrape-group-lists.js](/scrape-group-lists.js)).
- Make the extension better. Fix bugs, if found. Add more features. Improve existing features.

## Instructions for Developers

To rebuild the extension:
``` bash
$ git clone https://github.com/sidvishnoi/fb-dev-interest.git
$ cd fb-dev-interest
$ npm install
$ npm run build # builds the dist folder only, run after each edit
```

You can load the dist folder in Chrome from the chrome://extensions/ page in Developer Mode to install the extension.

To create the extension's CRX file, use the Google Chrome Browser: https://developer.chrome.com/extensions/packaging. Use the `dist` folder to create package.
The CRX file can be installed by a simple drag and drop in chrome://extensions/ page.

Rename the .crx file from `dist.crx` to `Merge Facebook Dev Circles by Interests.crx` and `dist.pem` to `key.pem` to create a release.

## Todo

- More interactive feed.
- Get App Token through login SDK.
- Track keywords with Facebook Analytics SDK.
- Firefox add-on maybe?
