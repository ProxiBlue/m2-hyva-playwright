import { test as hyvaBase } from "@hyva/fixtures";
import CommonPage from "@common/pages/common.page";
import PPSCartPage from "../pages/cart.page";
import PPSHomePage from "../pages/home.page";

type pages = {
    commonPage: CommonPage;
};

const testPages = hyvaBase.extend<pages>({
    cartPage: async ({ page }, use, workerInfo) => {
        await use(new PPSCartPage(page, workerInfo));
    },
    homePage: async ({ page }, use, workerInfo) => {
        await use(new PPSHomePage(page, workerInfo));
    },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
