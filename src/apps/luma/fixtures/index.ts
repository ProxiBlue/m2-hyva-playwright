import { test as baseTest } from "@playwright/test";
import CommonPage from "@common/pages/common.page";
import HomePage from "../pages/home.page";

type pages = {
    commonPage: CommonPage;
    homePage: HomePage;
};

const testPages = baseTest.extend<pages>({
    commonPage: async ({ page }, use, workerInfo) => {
        await use(new CommonPage(page, workerInfo));
    },
    homePage: async ({ page }, use, workerInfo) => {
        await use(new HomePage(page, workerInfo));
    },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
