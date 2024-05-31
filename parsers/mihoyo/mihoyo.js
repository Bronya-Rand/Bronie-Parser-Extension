import { getRequestHeaders } from '../../../../../../script.js';
import { renderExtensionTemplateAsync } from '../../../../../extensions.js';
import { POPUP_RESULT, POPUP_TYPE, callGenericPopup } from '../../../../../popup.js';
{import('../../../../../scrapers.js').Scraper}
import { SlashCommand } from '../../../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandNamedArgument } from '../../../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../../../slash-commands/SlashCommandParser.js';

/**
 * Scrapes data from the miHoYo/HoYoverse HoYoLAB wiki.
 * @implements {Scraper}
 */
export class miHoYoScraper {
    constructor() {
        this.id = 'mihoyo';
        this.name = 'miHoYo';
        this.description = 'Download a page from the miHoYo/HoYoverse HoYoLAB wiki.';
        this.iconClass = 'scripts/extensions/third-party/Bronie-Parser-Extension/parsers/mihoyo/mihoyo.svg';
        this.iconAvailable = false; // There is no miHoYo icon in Font Awesome.

        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'mihoyo',
            /** @param {{wiki: string, wiki_id: string}} namedArgs @returns {string} */
            callback: async ({wiki, wiki_id}) => {
                try {
                    if (!wiki) {
                        throw new Error('A specific HoYoLab wiki is required');
                    }
                    if (!wiki_id) {
                        throw new Error('A specific HoYoLab wiki ID is required');
                    }

                    const miHoYoWiki = String(wiki.trim() || '');
                    if (['hsr', 'genshin'].indexOf(miHoYoWiki) === -1) {
                        throw new Error('Unknown wiki name identifier');
                    }

                    if (!await this.isAvailable()) {
                        throw new Error('The miHoYo plugin is not installed or failed to initialize. Check the installation or server logs and try again.');
                    }
                    
                    const result = await this.begin_parse(miHoYoWiki, wiki_id, true);
                    return result;
                } catch (error) {
                    toastr.error(error.message);
                    return '';
                }
            },
            returns: ARGUMENT_TYPE.STRING,
            namedArgumentList: [
                new SlashCommandNamedArgument('wiki', 'The specific HoYoLab wiki to scrape from', ["hsr", "genshin"], true, false),
                new SlashCommandNamedArgument('wiki_id', 'The HoYoLab wiki ID to scrape', ARGUMENT_TYPE.NUMBER, true, false),
            ],
            unnamedArgumentList: [],
            helpString: `
            <div>
                <p>Returns a string of scraped data from the miHoYo/HoYoverse HoYoLAB wiki by Wiki Page and ID.</p>
            </div>
            <div>
                <strong>Example:</strong>
                <ul>
                    <li>
                        <pre><code>/mihoyo wiki=hsr wiki_id=14</code></pre>
                        will parse the Honkai: Star Rail wiki for Wiki Entry ID '14' (Bronya).
                    </li>
                    <li>
                        <pre><code>/mihoyo wiki=genshin wiki_id=14</code></pre>
                        will parse the Genshin Impact wiki for Wiki Entry ID '14' (Amber).
                    </li>
                </ul>
            </div>
            `,
        }));
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

        if (['hsr', 'genshin'].indexOf(miHoYoWiki) === -1) {
            throw new Error('Unknown wiki name identifier');
        }

        if (!await this.isAvailable()) {
            throw new Error('The miHoYo plugin is not installed or failed to initialize. Check the installation or server logs and try again.');
        }

        let toast;
        if (miHoYoWiki === 'hsr') {
            toast = toastr.info(`Scraping the Honkai: Star Rail HoYoLAB wiki for Wiki Entry ID: ${miHoYoWikiID}`);
        } else {
            toast = toastr.info(`Scraping the Genshin Impact wiki for Wiki Entry ID: ${miHoYoWikiID}`);
        }

        return await this.begin_parse(miHoYoWiki, miHoYoWikiID);
    }

    /** Parse the data from the miHoYo/HoYoverse HoYoLAB wiki.
     * @param {string} wiki The specific HoYoLab wiki to scrape from
     * @param {string} wiki_id The HoYoLab wiki ID to scrape
     * @param {boolean} print_data Whether to return the data as a string or as a file
     * @returns {Promise<File[] | combinedContent: string>} File attachments scraped from the wiki or the data as a string.
     */
    async begin_parse(wiki, wiki_id, print_data = false) {
        const result = await fetch('/api/plugins/hoyoverse/silver-wolf', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ miHoYoWiki: wiki, miHoYoWikiID: wiki_id }),
        });

        if (!result.ok) {
            const error = await result.text();
            throw new Error(error);
        }

        const data = await result.json();

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

        if (print_data) {
            return combinedContent;
        }

        const fileName = data[0].name;
        const file = new File([combinedContent], `${fileName}.txt`, { type: 'text/plain' });
        return [file];
    }
}