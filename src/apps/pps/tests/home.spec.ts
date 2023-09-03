import {describe, test} from "@hyva/fixtures";
import * as actions from "@utils/base/web/actions";
import * as locators from "@hyva/locators/home.locator";
import {expect} from "@playwright/test";
import * as searchSelectors from "@hyva/locators/search.locator";
import * as product from "@hyva/locators/product.locator";
import * as pageLocators from "@hyva/locators/page.locator";
// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/home.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/home.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/home.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}

describe("Home", () => {
    test("Verify home page", async ({homePage}) => {
        await homePage.navigateTo();
        await homePage.verifyDomTitle();
    });

    test('Can perform search from homepage', async ({homePage, isMobile}) => {
        await homePage.navigateTo();
        if (isMobile) {
            await homePage.page.click(searchSelectors.headerSearchIcon);
            await homePage.page.waitForSelector(searchSelectors.headerSearchFieldMobile);
            await homePage.page.fill(searchSelectors.headerSearchFieldMobile, data.search_term, {force: true});
            await homePage.page.press(searchSelectors.headerSearchFieldMobile, 'Enter');
        } else {
            await homePage.page.waitForSelector(searchSelectors.headerSearchField);
            await homePage.page.fill(searchSelectors.headerSearchField, data.search_term);
            await homePage.page.press(searchSelectors.headerSearchField, 'Enter');
        }
        await homePage.page.waitForSelector(pageLocators.pageTitle);
        const mainHeadingText = await homePage.page.$eval(pageLocators.pageTitle, (el) => el.textContent);
        await expect(mainHeadingText).toContain(data.search_term);
        await actions.verifyElementIsVisible(homePage.page, product.productGrid, homePage.workerInfo);
        await expect.poll(async () => homePage.page.locator(product.productGridItem).count()).toBeGreaterThan(0);
    });
});
