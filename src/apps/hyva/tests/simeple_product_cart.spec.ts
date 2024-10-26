import { test, describe } from "@hyva/fixtures";

describe("Cart actions with simple products", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
    });

    test("it can add a simple product to the cart ", async ({ cartPage, simpleProductPage }, testInfo) => {
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

});
