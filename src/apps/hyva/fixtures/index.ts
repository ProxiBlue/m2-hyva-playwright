import { test as baseTest } from "@playwright/test";
import CommonPage from "@common/pages/common.page";
import HomePage from "@hyva/pages/home.page";
import SimpleProductPage from "@hyva/pages/simple_product.page";
import CartPage from "@hyva/pages/cart.page";
import CategoryPage from "@hyva/pages/category.page";


type pages = {
    commonPage: CommonPage;
    homePage: HomePage;
    simpleProductPage: SimpleProductPage;
    cartPage: CartPage;
    categoryPage: CategoryPage;
};

const testPages = baseTest.extend<pages>({
    commonPage: async ({ page }, use, workerInfo) => {
        await use(new CommonPage(page, workerInfo));
    },
    homePage: async ({ page }, use, workerInfo) => {
        await use(new HomePage(page, workerInfo));
    },
    simpleProductPage: async ({ page }, use, workerInfo) => {
        await use(new SimpleProductPage(page, workerInfo));
    },
    cartPage: async ({ page }, use, workerInfo) => {
        await use(new CartPage(page, workerInfo));
    },
    categoryPage: async ({ page }, use, workerInfo) => {
        await use(new CategoryPage(page, workerInfo));
    },
});

baseTest.use({ ignoreHTTPSErrors: true})

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
