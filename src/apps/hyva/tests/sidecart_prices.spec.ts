import { test, describe, expect } from "@hyva/fixtures";
import { parsePrice } from "@utils/functions/price";
import { shouldSkipTest, isMobile } from "@utils/functions/test-skip";

describe("Side cart price check", () => {

    // With global slowMo + two add-to-cart rounds + drawer reloads the default
    // 30s budget is insufficient on slow dev envs; raise to 90s.
    test.setTimeout(90000);

    test.beforeEach(async ({ simpleProductPage, page }, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, "Test skipped for this environment: " + process.env.APP_NAME);
        test.skip(isMobile(page), "Sidecart not available on mobile viewport");
        await simpleProductPage.navigateTo();
        await simpleProductPage.addToCart();
    });

    test('it checks if the prices in the slider are displayed correctly', async ({ simpleProductPage, sideCartPage }, testInfo) => {
        await sideCartPage.checkQtyIndication(1);
        // Some stores are configured with checkout/cart/redirect_to_cart = 1, so after
        // addToCart() the browser is on /checkout/cart, not on the PDP. The product
        // price locator (".price-wrapper .price") only exists on the PDP, so navigate
        // back to the product page before reading its price.
        await simpleProductPage.navigateTo();
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
