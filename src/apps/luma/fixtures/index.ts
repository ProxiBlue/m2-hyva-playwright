import { test as testBase } from "@common/fixtures";
import SimpleProductPage from "@luma/pages/simple_product.page";
import CartPage from "@luma/pages/cart.page";
import LumaCheckoutPage from "@luma/pages/checkout.page";
import CustomerPage from "@luma/pages/customer.page";

type pages = {
    simpleProductPage: SimpleProductPage;
    cartPage: CartPage;
    checkoutPage: LumaCheckoutPage;
    customerPage: CustomerPage;
};

const testPages = testBase.extend<pages>({
    simpleProductPage: async ({ page }, use, workerInfo) => {
        await use(new SimpleProductPage(page, workerInfo));
    },
    cartPage: async ({ page }, use, workerInfo) => {
        await use(new CartPage(page, workerInfo));
    },
    checkoutPage: async ({ page }, use, workerInfo) => {
        await use(new LumaCheckoutPage(page, workerInfo));
    },
    customerPage: async ({ page }, use, workerInfo) => {
        await use(new CustomerPage(page, workerInfo));
    }
});

export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
