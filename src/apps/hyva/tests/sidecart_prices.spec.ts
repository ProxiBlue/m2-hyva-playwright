import { test, describe, expect } from "@hyva/fixtures";
import { parsePrice } from "@utils/functions/price";
import { shouldSkipTest } from "@utils/functions/test-skip";

describe("Side cart price check", () => {

    test.beforeEach(async ({ simpleProductPage }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test('it checks if the prices in the slider are displayed correctly', async ({ simpleProductPage, sideCartPage }, testInfo) => {
        await sideCartPage.checkQtyIndication(1);
        let itemPrice = await simpleProductPage.getProductPrice();
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        let lineItemPrice = await sideCartPage.getItemPrice(0);
        expect(lineItemPrice).toEqual(itemPrice);
        let miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        expect(miniCartSubtotalText).not.toBeNull()
        // @ts-ignore
        let total = parsePrice(miniCartSubtotalText);
        let cleanItemPrice = parsePrice(itemPrice);
        expect(total).toEqual(cleanItemPrice);
        // let's add in another item, and confirm price is increased correctly
        await simpleProductPage.navigateTo();
        itemPrice = await simpleProductPage.getProductPrice();
        await simpleProductPage.addToCart();
        await sideCartPage.checkQtyIndication(2);
        await sideCartPage.open();
        // get the subtotal of the first product in the cart
        lineItemPrice = await sideCartPage.getItemPrice(0)
        expect(lineItemPrice).toEqual(itemPrice);
        miniCartSubtotalText = await sideCartPage.getMiniCartSubtotal();
        expect(miniCartSubtotalText).not.toBeNull()
        // @ts-ignore
        total = parsePrice(miniCartSubtotalText);
        cleanItemPrice = parsePrice(itemPrice) * 2;
        expect(total).toEqual(cleanItemPrice);
    });

});
