import {test as baseTest} from "@hyva/fixtures";
import {Customer} from "@hyva/fixtures/customer";
import { CustomerData } from '@hyva/interfaces/CustomerData';

const test = baseTest.extend<{ customerData: CustomerData }>({
    customerData: async ({page}, use) => {
        const customer = new Customer();
        const customerData: CustomerData = customer.getCustomerData();
        await use(customerData);
    },
});

test.setTimeout(60000);

test("it can create and login to account", async ({customerPage, customerData}, testInfo) => {
    await customerPage.createAccount(customerData);
    await customerPage.logout();
    await customerPage.login(customerData);
});


