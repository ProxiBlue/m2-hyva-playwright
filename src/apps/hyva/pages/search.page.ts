import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/search.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as productLocators from "@hyva/locators/product.locator";
import { SearchData } from "@hyva/interfaces/SearchData";
import { loadJsonData } from "@utils/functions/file";

// Default search data structure
const defaultData: SearchData = {
  default: {
    header_title: "",
    page_title_text: "",
    product_category: "",
    no_results: "",
    get_hint: "",
    hint_result: ""
  }
};

// Load the search data using the utility function
let data = loadJsonData<SearchData>('search.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

export default class SearchPage extends BasePage<SearchData> {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to the base page class
    }

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL || '', this.workerInfo);
        await this.page.click(locators.headerSearchIcon);
    }

    async search(searchTerm: string, isMobile: boolean = false) {
        if (isMobile) {
            await this.page.click(locators.headerSearchIcon);
            await this.page.waitForSelector(locators.headerSearchFieldMobile);
            await this.page.fill(locators.headerSearchFieldMobile, searchTerm, {force: true});
            await this.page.press(locators.headerSearchFieldMobile, 'Enter');
        } else {
            await this.page.waitForSelector(locators.headerSearchField);
            await this.page.fill(locators.headerSearchField, searchTerm);
            await this.page.press(locators.headerSearchField, 'Enter');
        }
        await this.page.waitForLoadState('domcontentloaded');
    }

    async searchWithMultipleHits(isMobile: boolean = false) {
        await this.search(this.data.default.product_category || '', isMobile);
        await this.page.waitForSelector(pageLocators.pageTitle);
        const mainHeadingText = await this.page.locator(pageLocators.pageTitle).textContent();
        expect(mainHeadingText).toContain(`Search results for: '${this.data.default.product_category}'`);
        await actions.verifyElementIsVisible(this.page, productLocators.productGrid, this.workerInfo);
        await expect.poll(async () => this.page.locator(productLocators.productGridItem).count()).toBeGreaterThan(0);
    }

    async searchWithNoResults(isMobile: boolean = false) {
        await this.search(this.data.default.no_results || '', isMobile);
        await this.page.waitForSelector(pageLocators.pageTitle);
        const mainHeadingText = await this.page.locator(pageLocators.pageTitle).textContent();
        expect(mainHeadingText).toContain(`Search results for: '${this.data.default.no_results}'`);
        await this.page.waitForSelector(locators.noResultsMessage);
        const noResultsText = await this.page.locator(locators.noResultsMessage).textContent();
        expect(noResultsText).toContain('Your search returned no results.');
    }

    async checkSearchSuggestions(isMobile: boolean = false) {
        await this.page.waitForSelector(locators.headerSearchField);
        await this.page.fill(locators.headerSearchField, this.data.default.get_hint || '');
        await this.page.waitForSelector(locators.searchSuggestions);
        const suggestionText = await this.page.locator(locators.searchSuggestions).textContent();
        expect(suggestionText).toContain(this.data.default.hint_result);
    }
}
