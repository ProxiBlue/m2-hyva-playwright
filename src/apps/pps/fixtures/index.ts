import { test as baseTest } from "@playwright/test";
import CartPage from "../pages/cart.page";
import CommonPage from "@common/pages/common.page";

type pages = {
    cartPage: CartPage;
    commonPage: CommonPage;
};

const testPages = baseTest.extend<pages>({
    commonPage: async ({ page }, use, workerInfo) => {
        await use(new CommonPage(page, workerInfo));
    },
    cartPage: async ({ page }, use, workerInfo) => {
        await use(new CartPage(page, workerInfo));
    },
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
