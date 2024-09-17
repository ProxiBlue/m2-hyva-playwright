import {test as baseTest} from "@hyva/fixtures";
import {Customer} from "@hyva/fixtures/customer";

const test = baseTest.extend<{ customerData: Customer }>({
    customerData: async ({page}, use) => {
        const customerData = use(new Customer());
    },
});

test.setTimeout(60000);

test("it can create and login to account", async ({customerPage, customerData}, testInfo) => {
    await customerPage.createAccount( customerData.getFirstName(), customerData.getLastName(), customerData.getEmail(), customerData.getPassword());
    await customerPage.logout();
    await customerPage.login(customerData.getFirstName(), customerData.getLastName(), customerData.getEmail(), customerData.getPassword());
});


