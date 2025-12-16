import {describe, test} from "@admin/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";


describe("Admin Checkouts", () => {

    test.beforeEach(async ({adminPage, adminOrdersPage}, testInfo) => {
        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await adminPage.navigateTo();
        await adminPage.login();
        await adminOrdersPage.navigateTo();
    });

    test("checkout using Check / Money order", async ({customerData, adminOrdersPage}, testInfo) => {
        test.setTimeout(300000); // Extend timeout to 5 minutes (300 seconds)
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText('Check / Money order');
        await adminOrdersPage.disableOrderEmailSend();
        await adminOrdersPage.placeOrder()
    });

    test("checkout using Cash on Delivery", async ({adminOrdersPage, customerData}, testInfo) => {
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText('Cash On Delivery');
        await adminOrdersPage.disableOrderEmailSend();
        await adminOrdersPage.placeOrder()
    });

    test("checkout using Purchase Order", async ({adminOrdersPage, customerData}, testInfo) => {
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText('Purchase Order');
        await adminOrdersPage.page.locator('input[name="payment[po_number]"]').fill('PO123456789').then(async () => {
            await adminOrdersPage.disableOrderEmailSend();
            await adminOrdersPage.placeOrder()
        })

    });




});
