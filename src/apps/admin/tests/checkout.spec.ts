import {describe, test} from "@admin/fixtures";
import { shouldSkipTest } from "@utils/functions/test-skip";
import { loadLocators } from "@utils/functions/file";

const locators = loadLocators('locators/orders.locator', 'admin');


describe("Admin Checkouts", () => {

    test.beforeEach(async ({adminPage, adminOrdersPage}, testInfo) => {
        test.setTimeout(120000);
        test.skip(process.env.APP_NAME === 'hyva' || process.env.TEST_BASE === 'hyva',
            'Admin tests require admin access - skipped for hyva environment');

        // Use the helper function to determine if the test should be skipped
        const shouldSkip = shouldSkipTest(testInfo);

        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await adminPage.navigateTo();
        await adminPage.login();
        await adminOrdersPage.navigateTo();
    });

    test("checkout using Check / Money order", async ({customerData, adminOrdersPage}, testInfo) => {
        test.setTimeout(300000);
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText(locators.payment_check_money_order);
        await adminOrdersPage.disableOrderEmailSend();
        await adminOrdersPage.placeOrder()
    });

    test("checkout using Cash on Delivery", async ({adminOrdersPage, customerData}, testInfo) => {
        test.setTimeout(300000);
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText(locators.payment_cash_on_delivery);
        await adminOrdersPage.disableOrderEmailSend();
        await adminOrdersPage.placeOrder()
    });

    test("checkout using Purchase Order", async ({adminOrdersPage, customerData}, testInfo) => {
        test.setTimeout(300000);
        await adminOrdersPage.createNewOrderWithNewCustomer(customerData)
        await adminOrdersPage.selectFirstSimpleProductToAddToOrder();
        await adminOrdersPage.selectFirstShippingMethodToAddToOrder();
        await adminOrdersPage.selectPaymentMethodByText(locators.payment_purchase_order);
        await adminOrdersPage.page.locator(locators.purchase_order_number_field).fill(locators.purchase_order_number_value).then(async () => {
            await adminOrdersPage.disableOrderEmailSend();
            await adminOrdersPage.placeOrder()
        })

    });




});
