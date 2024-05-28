import { test, describe } from "@hyva/fixtures";

describe("Cart actions with one Item in cart", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test("Can change the quantity in the cart", async ({ cartPage }, testInfo) => {
        test.slow();
        await cartPage.navigateTo();
        await cartPage.changeQuantity(0,2);
    });

    test("Can delete item from the cart", async ({ cartPage }, testInfo) => {
        await cartPage.navigateTo();
        await cartPage.deleteItem(0);
    });

});
