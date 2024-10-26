import {describe, test} from "@admin/fixtures";

describe("Admin Checkout: Cash On Delivery", () => {

    test("checkout using cash on delivery", async ({adminPage, customerData}, testInfo) => {
        await adminPage.navigateTo();
        await adminPage.login();
        await adminPage.navigateToOrdersPage();
        await adminPage.createNewOrderWithNewCustomer(customerData)
        await adminPage.selectFirstSimpleProductToAddToOrder();
        await adminPage.selectFirstShippingMethodToAddToOrder();
        await adminPage.selectPaymentMethodByText('Cash On Delivery');
        await adminPage.disableOrderEmailSend();
        await adminPage.placeOrder()
    });


});
