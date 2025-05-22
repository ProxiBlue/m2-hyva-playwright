import BasePage from "@common/pages/base.page";
import {Page, test, TestInfo, expect} from "@playwright/test";
import * as actions from "@utils/base/web/actions";
import * as searchSelectors from "@hyva/locators/search.locator";
import * as product from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";
import * as locators from "../locators/home.locator";

// Define the interface for the home data structure
interface HomeData {
  default: {
    url?: string;
    header_title?: string;
    page_title_text?: string;
    search_term?: string;
  };
}

// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data: HomeData = {
  default: {
    header_title: "",
    page_title_text: "",
    search_term: ""
  }
};
// Load data synchronously to ensure it's available when needed
const fs = require("fs");
try {
    let dataPath;
    if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/home.data.json')) {
        dataPath = __dirname + '/../../' + process.env.APP_NAME + '/data/home.data.json';
    } else {
        dataPath = __dirname + '/../data/home.data.json';
    }
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    let parsedData = JSON.parse(jsonData);
    // Ensure data has a default property
    if (!parsedData.default) {
        data = { default: parsedData };
    } else {
        data = parsedData;
    }
} catch (error) {
    console.error(`Error loading home data: ${error}`);
}


export default class HomePage extends BasePage<HomeData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    async navigateTo() {
        await actions.navigateTo(this.page, process.env.URL || '', this.workerInfo);
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
                await actions.verifyElementIsVisible(this.page, product.productGrid, this.workerInfo);
                await expect.poll(async () => this.page.locator(product.productGridItem).count()).toBeGreaterThan(0);
            });
    }

}
