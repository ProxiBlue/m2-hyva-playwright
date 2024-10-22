import { test as baseTest } from "@common/fixtures";
import HomePage from "@hyva/pages/home.page";
import SimpleProductPage from "@hyva/pages/simple_product.page";
import CartPage from "@hyva/pages/cart.page";
import CategoryPage from "@hyva/pages/category.page";
import SideCartPage from "@hyva/pages/sidecart.page";
import CustomerPage from "@hyva/pages/customer.page";

type pages = {
    homePage: HomePage;
    simpleProductPage: SimpleProductPage;
    cartPage: CartPage;
    categoryPage: CategoryPage;
    sideCartPage: SideCartPage;
    customerPage: CustomerPage;
};

const testPages = baseTest.extend<pages>({
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
    }
});

baseTest.use({ ignoreHTTPSErrors: true})
export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
