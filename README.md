# Merge Facebook Dev Circles by Interests

> A Chrome extension that filters through Facebook Dev Circles around the world to get only the interesting posts in your feed.

## [Download the extension (.crx)](https://github.com/sidvishnoi/fb-dev-interest/releases/download/v1.1/Merge.Facebook.Dev.Circles.by.Interests.crx)

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

### Highlight Keyword Matches

Enable to highlight matched keywords in posts, otherwise disable.

### Blacklist Groups

Add a group's name (and make use to auto-complete) to blacklist it (avoid showing posts from that group in your feed). You might want to blacklist a group as you might not be interested in their posts or not able to understand their language.

# Contributing

I would love your PRs. You can contribute :

- by adding more keyword suggestions (edit: [/options.dev/keywords.js](/options.dev/keywords.js)).
- letting me know of additions/removals of public Dev circle groups (edit: [/options.dev/groups.js](/options.dev/groups.js), you may use [/scrape-group-lists.js](/scrape-group-lists.js)).
- Make the extension better. Fix bugs, if found. Add more features. Improve existing features.

## Todo

- More interactive feed.
- Firefox add-on maybe?
