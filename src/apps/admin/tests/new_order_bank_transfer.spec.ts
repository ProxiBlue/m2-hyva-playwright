import {describe, test} from "@admin/fixtures";

describe("Admin Checkout: Bank Transfer", () => {

    test("checkout using bank transfer payment", async ({adminPage, customerData}, testInfo) => {
        // @ts-ignore
        test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);
        await adminPage.navigateTo();
        await adminPage.login();
        await adminPage.navigateToOrdersPage();
        await adminPage.createNewOrderWithNewCustomer(customerData)
        await adminPage.selectFirstSimpleProductToAddToOrder();
        await adminPage.selectFirstShippingMethodToAddToOrder();
        await adminPage.selectPaymentMethodByText('Bank Transfer Payment');
        await adminPage.disableOrderEmailSend();
        await adminPage.placeOrder()
    });


});
