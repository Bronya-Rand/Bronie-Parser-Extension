# Bronie Parser Extension
A SillyTavern extension that adds third-party data banks into SillyTavern (miHoYo/HoYoverse HoYoLAB, etc.)
> Bronie: Bronie! :)

## Requirements
- SillyTavern 1.12.0
- Node.js 20+

## Installation
1. Click *Extensions* then **Install Extension**
2. Paste in the following __link__ into the text field and click Save: `https://github.com/Bronya-Rand/Bronie-Parser-Extension`.
3. Install any third-party data bank plugin into SillyTavern's `plugins` folder.
4. Restart SillyTavern.
5. Go to *Data Bank* under the __magic wand__ icon. You should see your third-party parser appear!

## Creating a Parser for the Bronie Extension
> I recommend referring to the supplied miHoYo/HoYoVerse extension for making a parser. For this example, we will use a theoretical parser named `fuXuan`.
1. Create a folder for your extension followed by a blank JS file.
2. Program the logic of the Scraper class and the things you want.
3. Create the HTML UI in a blank *HTML* file.
4. In `index.js`, import your parser and add it to *PARSER_LIST*
```js
import { miHoYoScraper } from './parsers/mihoyo/mihoyo.js';
import { fuXuan } from './parsers/fuXuan/fuXuan.js';

const MODULE_NAME = 'Bronie Parser Extension';
const PARSER_LIST = [
    new miHoYoScraper(),
    new fuXuan(),
]
```
5. Restart SillyTavern.
5. Go to *Data Bank* under the __magic wand__ icon. You should see your new parser appear!

## Parser Icon Setup
If your parser doesn't have an icon defined in FontAwesome, first grab the icon and save it as a white SVG file of 20x20.
In your parser file, do the following under `constructor()`
```js
export class yourScraper {
    constructor() {
        ...
        this.iconClass = 'scripts/extensions/Bronie-Parser-Extension/parsers/your-parser/parserIcon.svg';
        this.iconAvailable = false; // True: Icon exists in FontAwesome | False: Icon doesn't exist
    }

    ...
}
```
> If your parser has a icon in FontAwesome, make sure `this.iconAvailable` is set to *True*.

## Why Bronie?
Because Bronie.