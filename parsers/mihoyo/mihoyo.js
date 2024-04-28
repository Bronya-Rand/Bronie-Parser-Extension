import { getRequestHeaders } from '../../../../../../script.js';
import { renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { POPUP_RESULT, POPUP_TYPE, callGenericPopup } from '../../../../../popup.js';
{import('../../../../../scrapers.js').Scraper}

/**
 * Scrapes data from the miHoYo/HoYoverse HoYoLAB wiki.
 * @implements {Scraper}
 */
export class miHoYoScraper {
    constructor() {
        this.id = 'mihoyo';
        this.name = 'miHoYo';
        this.description = 'Scrapes a page from the miHoYo/HoYoverse HoYoLAB wiki.';
        this.iconClass = 'scripts/extensions/third-party/Bronie-Parser-Extension/parsers/mihoyo/mihoyo.svg';
        this.iconAvailable = false; // There is no miHoYo icon in Font Awesome.
    }

    /**
     * Check if the scraper is available.
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        try {
            const result = await fetch('/api/plugins/hoyoverse/probe', {
                method: 'POST',
                headers: getRequestHeaders(),
            });

            return result.ok;
        } catch (error) {
            console.debug('Could not probe miHoYo plugin', error);
            return false;
        }
    }

    /**
     * Outputs Data Information in a human-readable format.
     * @param {Object} m Data to be parsed
     * @returns {string} Human-readable format of the data
     */
    parseOutput(m) {
        let temp = '';
        for (const d in m) {
            if (m[d].key === "") {
                temp += `- ${m[d].value}\n`;
                continue;
            }
            temp += `- ${m[d].key}: ${m[d].value}\n`;
        }
        return temp;
    }

    /** Scrape data from the miHoYo/HoYoverse HoYoLAB wiki.
     * @returns {Promise<File[]>} File attachments scraped from the wiki.
     */

    async scrape() {
        let miHoYoWiki = '';
        let miHoYoWikiID = '';

        const template = $(await renderExtensionTemplateAsync('third-party/Bronie-Parser-Extension', 'parsers/mihoyo/mihoyo', {}));

        template.find('select[name="mihoyoScrapeWikiDropdown"]').on('change', function () {
            miHoYoWiki = String($(this).val());
        });
        template.find('input[name="mihoyoScrapeWikiID"]').on('input', function () {
            miHoYoWikiID = String($(this).val());
        });

        const confirm = await callGenericPopup(template, POPUP_TYPE.CONFIRM, '', { wide: false, large: false });

        if (confirm !== POPUP_RESULT.AFFIRMATIVE) {
            return;
        }

        if (!miHoYoWiki) {
            toastr.error('A specific HoYoLab wiki is required');
            return;
        }

        if (!miHoYoWikiID) {
            toastr.error('A specific HoYoLab wiki ID is required');
            return;
        }

        if (miHoYoWiki === 'genshin') {
            toastr.error('The Genshin Impact parser has not been implemented *yet*');
            return;
        }

        let toast;
        if (miHoYoWiki === 'hsr') {
            toast = toastr.info(`Scraping the Honkai: Star Rail HoYoLAB wiki for Wiki Entry ID: ${miHoYoWikiID}`);
        } else {
            toast = toastr.info(`Scraping the Genshin Impact wiki for Wiki Entry ID: ${miHoYoWikiID}`);
        }

        let result;
        if (miHoYoWiki === 'hsr') {
            result = await fetch('/api/plugins/hoyoverse/silver-wolf', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({ miHoYoWiki, miHoYoWikiID }),
            });
        } else if (miHoYoWiki === 'genshin') {
            result = await fetch('/api/plugins/hoyoverse/furina', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({ miHoYoWiki, miHoYoWikiID }),
            });
        } else {
            throw new Error('Unknown wiki name identifier');
        }

        if (!result.ok) {
            const error = await result.text();
            throw new Error(error);
        }

        const data = await result.json();
        toastr.clear(toast);

        const fileName = data[0].name;
        const dataContent = data[0].content;

        //parse the data as a long string of data
        let combinedContent = '';
        combinedContent += `Name: ${data[0].name}\n`;

        if (dataContent.description !== "") {
            combinedContent += `Description: ${dataContent.description}\n\n`;
        }

        if (dataContent.modules != []) {
            for (const m in dataContent.modules) {
                if (dataContent.modules[m].data.length === 0) {
                    continue;
                }
                combinedContent += dataContent.modules[m].name + '\n';
                combinedContent += this.parseOutput(dataContent.modules[m].data);
                combinedContent += '\n';
            } 
        }

        const file = new File([combinedContent], `${fileName}.txt`, { type: 'text/plain' });

        return [file];
    }
}