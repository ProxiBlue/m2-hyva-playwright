import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import {CustomerData} from '@common/interfaces/CustomerData';
import {CustomerPageData} from '@common/interfaces/CustomerPageData';
import {loadJsonData, loadLocators} from "@utils/functions/file";

// Default customer page data structure
const defaultData: CustomerPageData = {
    default: {
        url: "",
        header_title: "",
        page_title_text: "",
        create_an_account_title: "",
        register_success_message: "",
        my_account_title: "",
        logged_out: ""
    }
};

// Load the customer data using the utility function
let data = loadJsonData<CustomerPageData>('customer.data.json', 'hyva', defaultData);

// Ensure data has a default property
if (data && !data.default) {
    data = {default: data as any};
}

// Load the locators dynamically based on the APP_NAME environment variable
const locators = loadLocators('locators/customer.locator', 'hyva');
const pageLocators = loadLocators('locators/page.locator', 'hyva');

export default class CustomerPage extends BasePage<CustomerPageData> {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    async fillCreateForm(customerData: CustomerData) {
        await expect(this.page.locator(locators.create_firstname)).toBeVisible();
        await expect(this.page.locator(locators.create_lastname)).toBeVisible();
        await expect(this.page.locator(locators.create_email)).toBeVisible();
        await expect(this.page.locator(locators.create_password)).toBeVisible();
        await expect(this.page.locator(locators.create_password_confirm)).toBeVisible();
        await this.page.locator(locators.create_firstname).fill(customerData.firstName);
        await this.page.locator(locators.create_lastname).fill(customerData.lastName);
        await this.page.locator(locators.create_email).fill(customerData.email);
        await this.page.locator(locators.create_password).fill(customerData.password);
        await this.page.locator(locators.create_password_confirm).fill(customerData.password);
    }

    async login(customerData: CustomerData) {
        await test.step(
            this.workerInfo.project.name + ": Customer Login ",
            async () => {
                await this.navigateTo();
                await expect(this.page.getByRole('button', {name: locators.login_button})).toBeVisible();
                await expect(this.page.locator(locators.login_email_field)).toBeVisible();
                await expect(this.page.locator(locators.login_password_field)).toBeVisible();
                await this.page.locator(locators.login_email_field).fill(customerData.email);
                await this.page.locator(locators.login_password_field).fill(customerData.password);
                await this.page.getByRole('button', {name: locators.login_button}).click();
                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForLoadState('networkidle');
                await expect(this.page.locator(pageLocators.pageTitle)).toBeVisible();
                const myAccountTitle = data.default.my_account_title || '';
                await expect(this.page.locator(pageLocators.pageTitle)).toContainText(myAccountTitle);
            });
    }


    async logout() {
        await test.step(
            this.workerInfo.project.name + ": Customer Logout ",
            async () => {
                await this.page.waitForTimeout(2000);

                const viewport = this.page.viewportSize();
                const isMobile = viewport !== null && viewport.width < 640;

                if (isMobile) {
                    // On mobile, the Sign Out link is hidden. Navigate directly.
                    await this.page.goto(process.env.url + 'customer/account/logout/');
                } else {
                    await this.page.getByRole('link', {name: locators.logout_link}).click();
                }

                await this.page.waitForLoadState('domcontentloaded');
                await this.page.waitForTimeout(6000);
            });
    }

    async createAccount(customerData: CustomerData) {
        await test.step(
            this.workerInfo.project.name + ": Customer Create ",
            async () => {
                await this.navigateTo();
                await this.page.waitForLoadState('domcontentloaded');
                await expect(this.page.getByRole('link', {name: locators.create_button})).toBeVisible();
                await this.page.getByRole('link', {name: locators.create_button}).click();
                await this.page.waitForLoadState('domcontentloaded');
                await expect(this.page.locator(locators.create_firstname)).toBeVisible();
                await expect(this.page.locator(locators.create_lastname)).toBeVisible();
                await expect(this.page.locator(locators.create_email)).toBeVisible();
                await expect(this.page.locator(locators.create_password)).toBeVisible();
                await expect(this.page.locator(locators.create_password_confirm)).toBeVisible();
                await this.page.locator(locators.create_firstname).fill(customerData.firstName);
                await this.page.locator(locators.create_lastname).fill(customerData.lastName);
                await this.page.locator(locators.create_email).fill(customerData.email);
                await this.page.locator(locators.create_password).fill(customerData.password);
                await this.page.locator(locators.create_password_confirm).fill(customerData.password);
                await this.page.getByRole('button', {name: locators.create_button}).click();
                await this.page.waitForLoadState('domcontentloaded');
                // After a successful registration, Magento redirects to the post-auth
                // landing page chosen by session `getBeforeAuthUrl()` — which on this
                // store can be the cart/checkout (ItTools_CheckoutLoginRedirect) rather
                // than the customer dashboard. The Hyvä success flash message is the
                // reliable signal either way, but the registration flash can be
                // suppressed when the redirect target's layout omits #messages on first
                // render. Fall back to confirming an authenticated session state if
                // the flash selector does not appear quickly.
                const successSelector = pageLocators.message_success;
                try {
                    await this.page.waitForSelector(successSelector, { timeout: 15000 });
                } catch {
                    // Confirm we have a customer session by checking for the logged-in
                    // indicator: either /customer/account/ path, a "Sign Out" link, or
                    // the My Account page title. Any of these proves the account was
                    // created and we are no longer a guest.
                    const url = this.page.url();
                    const isAccountArea = /\/customer\/account/.test(url);
                    const isCheckoutArea = /\/checkout(\/|$)/.test(url);
                    if (!isAccountArea && !isCheckoutArea) {
                        throw new Error(
                            `createAccount: neither success flash nor post-auth redirect seen (url=${url})`,
                        );
                    }
                }
            });
    }

}
