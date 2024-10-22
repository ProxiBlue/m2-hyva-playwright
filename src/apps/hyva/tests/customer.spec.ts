import {describe, test} from "@hyva/fixtures";
describe("Customer Tests", () => {

    test.setTimeout(60000);

    test("it can create and login to account", async ({customerPage, customerData}, testInfo) => {
        await customerPage.createAccount(customerData);
        await customerPage.logout();
        await customerPage.login(customerData);
    });
});


