import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import { SearchData } from "@hyva/interfaces/SearchData";
import { loadJsonData, loadLocators } from "@utils/functions/file";

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

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/search.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');
const productLocators = loadLocators('locators/product.locator', 'hyva');

export default class SearchPage extends BasePage<SearchData> {

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to the base page class
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
        await test.step(
            this.workerInfo.project.name + ": Verify element is visible " + productLocators.productGrid,
            async () => expect(await this.page.locator(productLocators.productGrid).isVisible()).toBe(true)
        );
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
        await this.page.waitForTimeout(3000);

        // Check for suggestion items using the dedicated suggestions locator or fallback
        const suggestionsContainer = this.page.locator(locators.searchSuggestions);
        const hasSuggestions = await suggestionsContainer.isVisible({ timeout: 5000 }).catch(() => false);

        if (hasSuggestions) {
            const suggestionItems = suggestionsContainer.locator('li, a, [role="option"]');
            await expect(suggestionItems.first()).toBeVisible({ timeout: 5000 });
            const count = await suggestionItems.count();
            expect(count).toBeGreaterThan(0);
        } else {
            // Fallback: check that the search form has autocomplete results
            const autocompleteResults = this.page.locator('#search_autocomplete li, #search_autocomplete a');
            await expect(autocompleteResults.first()).toBeVisible({ timeout: 5000 });
        }

        // Verify hint text appears somewhere in suggestions
        const pageText = await this.page.locator('#search_autocomplete, ' + locators.searchSuggestions).textContent();
        expect(pageText?.toLowerCase()).toContain((this.data.default.hint_result || '').toLowerCase());
    }
}
