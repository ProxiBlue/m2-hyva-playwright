import BasePage from "@common/pages/base.page";
import {Page, test, TestInfo, expect} from "@playwright/test";
import { loadJsonData, loadLocators } from "@utils/functions/file";

// Define the interface for the home data structure
interface HomeData {
  default: {
    url?: string;
    header_title?: string;
    page_title_text?: string;
    search_term?: string;
  };
}

// Default home data structure
const defaultData: HomeData = {
  default: {
    header_title: "",
    page_title_text: "",
    search_term: ""
  }
};

// Load the home data using the utility function
let data = loadJsonData<HomeData>('home.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = { default: data as any };
}

// Load the locators dynamically based on the APP_NAME environment variable
const searchSelectors = loadLocators('locators/search.locator', 'hyva');
const product = loadLocators('locators/product.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');
const locators = loadLocators('locators/home.locator', 'hyva');


export default class HomePage extends BasePage<HomeData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        //@ts-ignore
        await this.page.goto(process.env.url || '');
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
        const url = this.page.url();
    }

    async canSearchFromHomepage(isMobile: boolean) {
        await test.step(
            this.workerInfo.project.name + ": Perform search on homepage ",
            async () => {
                if (isMobile) {
                    await this.page.click(searchSelectors.headerSearchIcon);
                    await this.page.waitForSelector(searchSelectors.headerSearchFieldMobile);
                    await this.page.fill(searchSelectors.headerSearchFieldMobile, this.data.default.search_term || '', {force: true});
                    await this.page.press(searchSelectors.headerSearchFieldMobile, 'Enter');
                } else {
                    await this.page.click(searchSelectors.headerSearchIcon);
                    await this.page.waitForSelector(searchSelectors.headerSearchField);
                    await this.page.fill(searchSelectors.headerSearchField, this.data.default.search_term || '');
                    await this.page.press(searchSelectors.headerSearchField, 'Enter');
                }
                await this.page.waitForSelector(pageLocators.pageTitle);
                const mainHeadingText = await this.page.$eval(pageLocators.pageTitle, (el) => el.textContent);
                expect(mainHeadingText).toContain(this.data.default.search_term);
                expect(await this.page.locator(product.productGrid).isVisible(), "Verify element is visible " + product.productGrid).toBe(true);
                await expect.poll(async () => this.page.locator(product.productGridItem).count()).toBeGreaterThan(0);
            });
    }

}
