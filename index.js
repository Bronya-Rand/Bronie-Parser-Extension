/* global SillyTavern */
import { ScraperManager } from '../../scrapers.js';
import { miHoYoScraper } from './parsers/mihoyo/mihoyo.js';

const MODULE_NAME = 'Bronie Parser Extension';
const PARSER_LIST = [
    new miHoYoScraper(),
]

jQuery(async () => {
    for (const parser of PARSER_LIST) {
        console.log(`[${MODULE_NAME}] Registering ${parser.name} scraper`);
        try {
            ScraperManager.registerDataBankScraper(parser);
            console.log(`[${MODULE_NAME}] Registered ${parser.name} scraper`);
        } catch (error) {
            console.error(`[${MODULE_NAME}] Failed to register ${parser.name} scraper`, error);
        }
    }
});
