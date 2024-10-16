import { test as baseTest } from "@playwright/test";
import CommonPage from "@common/pages/common.page";
import HomePage from "@hyva/pages/home.page";
import SimpleProductPage from "@hyva/pages/simple_product.page";
import CartPage from "@hyva/pages/cart.page";
import CategoryPage from "@hyva/pages/category.page";
import SideCartPage from "@hyva/pages/sidecart.page";
import CustomerPage from "@hyva/pages/customer.page";
import AdminPage from "@hyva/pages/admin.page";


type pages = {
    commonPage: CommonPage;
    homePage: HomePage;
    simpleProductPage: SimpleProductPage;
    cartPage: CartPage;
    categoryPage: CategoryPage;
    sideCartPage: SideCartPage;
    customerPage: CustomerPage;
    adminPage: AdminPage;
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
    sideCartPage: async ({ page }, use, workerInfo) => {
        await use(new SideCartPage(page, workerInfo));
    },
    customerPage: async ({ page }, use, workerInfo) => {
        await use(new CustomerPage(page, workerInfo));
    },
    adminPage: async ({ page }, use, workerInfo) => {
        await use(new AdminPage(page, workerInfo));
    },
});

baseTest.use({ ignoreHTTPSErrors: true})
export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
