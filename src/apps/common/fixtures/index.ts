import { test as baseTest } from "@playwright/test";
import CommonPage from "@common/pages/common.page";
import { Customer } from "@common/fixtures/customer";
import { CustomerData } from '@common/interfaces/CustomerData';

type pages = {
    commonPage: CommonPage;
    customerData: CustomerData;
};

const testPages = baseTest.extend<pages>({
    commonPage: async ({ page }, use, workerInfo) => {
        await use(new CommonPage(page, workerInfo));
    },
    customerData: async ({ page }, use) => {
        const customer = new Customer();
        const customerData: CustomerData = customer.getCustomerData();
        await use(customerData);
    },
});

baseTest.use({ ignoreHTTPSErrors: true})
export const test = testPages;
export const expect = testPages.expect;
export const describe = testPages.describe;
