# Bronie Parser Extension

A SillyTavern extension that adds third-party data banks into SillyTavern (miHoYo/HoYoverse HoYoLAB, etc.)

> Bronie: Bronie! :)

## Why Bronie?

Because Bronie.

## Requirements

- SillyTavern 1.12.0
- Node.js 20+

## Installation

1. Click _Extensions_ then **Install Extension**
2. Paste in the following **link** into the text field and click Save: `https://github.com/Bronya-Rand/Bronie-Parser-Extension`.
3. Install any third-party data bank plugin into SillyTavern's `plugins` folder.
4. Restart SillyTavern.
5. Go to _Data Bank_ under the **magic wand** icon. You should see your third-party scraper appear!

## Creating a Scraper for the Bronie Extension

> I recommend referring to the supplied miHoYo/HoYoVerse extension for making a scraper. For this example, we will use a theoretical scraper named `fuXuan`.

1. Create a folder for your extension followed by a blank JS file.
2. Program the logic of the Scraper class and the things you want.
3. Create the HTML UI in a blank _HTML_ file.
4. In `index.js`, import your scraper and add it to _PARSER_LIST_

```js
import { ScraperManager } from "../../../scrapers.js";
import { miHoYoScraper } from "./parsers/mihoyo/mihoyo.js";
import { fuXuan } from "./parsers/fuXuan/fuXuan.js";

const MODULE_NAME = "Bronie Parser Extension";
const PARSER_LIST = [new miHoYoScraper(), new fuXuan()];
```

5. Restart SillyTavern.
6. Go to _Data Bank_ under the **magic wand** icon. You should see your new scraper appear!

## Scraper Icon Setup

If your scraper doesn't have an icon defined in FontAwesome, do the following:

1. First grab the icon and save it as a white SVG file of 20x20.
2. In your scraper file, do the following under `constructor()`

```js
export class yourScraper {
    constructor() {
        ...
        this.iconClass = 'scripts/extensions/third-party/Bronie-Parser-Extension/parsers/your-parser/parserIcon.svg';
        this.iconAvailable = false; // True: Icon exists in FontAwesome | False: Icon doesn't exist
    }

    ...
}
```

> If your scraper has a icon in FontAwesome, make sure `this.iconAvailable` is set to _True_.

## Troubleshooting

1. My custom scraper is not appearing in the Data Bank!
   1. Make sure the plugin is installed in SillyTavern and that `enableServerPlugins` is set to _True_.
   2. Verify that you imported your scraper and added it into Bronie's `index.js` file as seen in [Creating a Scraper for the Bronie Extension](#creating-a-scraper-for-the-bronie-extension).
   3. The scraper you are installing has yet been implemented into the Bronie extension! (BronyaShock)
      > No worries! You can always make one and send a PR to get it implemented. (BronyaNod)
2. My custom scraper icon is not appearing!
   > Make sure the image has been added and you followed [Scraper Icon Setup](#scraper-icon-setup). Make sure it points directly to the scripts folder and all the way to your scraper.
