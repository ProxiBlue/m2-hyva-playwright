import {describe, test, expect} from "@admin/fixtures";
import * as locators from "@admin/locators/virtualTerminal.locator";
import {shouldSkipTest} from "@utils/functions/test-skip";
import {createCustomerData} from "@common/fixtures/customer";

/**
 * Non-iframe path (per project_stripe_iframe_intermittency): the genuine Stripe card
 * element/iframe is flaky in this test environment, so payment submission tests set the
 * Stripe test PaymentMethod id `pm_card_visa` directly on the hidden payment[payment_method]
 * input and submit the native form — see AdminVirtualTerminalPage.submitWithTestPaymentMethod().
 * This bypasses the tokenizer but still exercises the real Save controller (013) path.
 */
// Virtual Terminal is a loki-branch-only feature (Uptactics/VirtualTerminal module).
// Unconditionally skipped on non-loki branches — remove `.skip` when working on loki.
describe("Admin - Virtual Terminal Take Payment form", () => {

    test.beforeEach(async ({adminPage, adminVirtualTerminalPage}, testInfo) => {
        test.skip(process.env.APP_NAME === 'hyva' || process.env.TEST_BASE === 'hyva',
            'Admin tests require admin access - skipped for hyva environment');

        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);

        await adminPage.navigateTo();
        await adminPage.login();
        await adminVirtualTerminalPage.navigateTo();
    });

    test.afterEach(async ({adminPage}) => {
        // The shared AdminPage.logout() helper grabs the FIRST ".admin__action-dropdown-wrap"
        // on the page, which on sales/order/view (several VT tests land there after placing
        // a payment) resolves to an order-actions dropdown instead of the user-account one —
        // Sign Out stays hidden and logout() times out. Landing back on Dashboard first keeps
        // logout() on the page shape it was written for; this is a pre-existing admin.page.ts
        // ambiguity, not something to fix from a single spec.
        await adminPage.navigateTo();
        await adminPage.logout();
    });

    // @story: vt-initial-email-only
    test("it shows only the email input on initial load", async ({adminVirtualTerminalPage}) => {
        const page = adminVirtualTerminalPage.page;

        await expect(page.locator(locators.email_input)).toBeVisible();
        await expect(page.locator(locators.post_lookup_fields)).toBeHidden();
        await expect(page.locator(locators.stripe_payment_fieldset)).toBeHidden();
    });

    // @story: vt-unknown-email-reveals-name-inputs
    test("it reveals firstname and lastname inputs for an unknown email", async ({adminVirtualTerminalPage}, testInfo) => {
        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        await test.step(testInfo.project.name + ": look up an unknown email", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
        });

        await expect(page.locator(locators.firstname_field)).toBeVisible();
        await expect(page.locator(locators.lastname_field)).toBeVisible();
        await expect(page.locator(locators.existing_customer_field)).toBeHidden();
    });

    // @story: vt-known-email-shows-existing-label
    test("it shows the existing-customer label and hides name inputs for a known email", async ({adminVirtualTerminalPage}, testInfo) => {
        // Two full round trips (place a payment, then re-navigate + re-lookup) exceed the
        // default 30s test timeout on this admin instance under load.
        test.setTimeout(90000);

        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        // Create the customer first via a real VT payment, then look the same email up again.
        await test.step(testInfo.project.name + ": create the customer via a VT payment", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
            await adminVirtualTerminalPage.fillNewCustomerName(customerData.firstName, customerData.lastName);
            await adminVirtualTerminalPage.fillPaymentDetails('5.00');
            await adminVirtualTerminalPage.submitWithTestPaymentMethod('pm_card_visa');
            await adminVirtualTerminalPage.assertPaymentPlaced();
        });

        await test.step(testInfo.project.name + ": look up the now-existing email", async () => {
            await adminVirtualTerminalPage.navigateTo();
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
        });

        await expect(page.locator(locators.firstname_field)).toBeHidden();
        await expect(page.locator(locators.lastname_field)).toBeHidden();
        await expect(page.locator(locators.existing_customer_field)).toBeVisible();
        await expect(page.locator(locators.existing_customer_name)).toContainText(customerData.firstName);
    });

    // @story: vt-reveals-stripe-form-after-lookup
    test("it reveals the Stripe payment form after email lookup", async ({adminVirtualTerminalPage}, testInfo) => {
        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        await test.step(testInfo.project.name + ": look up an email", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
        });

        await expect(page.locator(locators.stripe_payment_fieldset)).toBeVisible();
        await expect(page.locator(locators.stripe_card_element)).toBeVisible();
    });

    // @story: vt-five-dollar-payment-places-order
    test("it submits a $5 payment with payment[payment_method]=pm_card_visa and lands on the order view", async ({adminVirtualTerminalPage}, testInfo) => {
        // Save (013) makes a real server-side Stripe API call to place the order — form
        // fill + lookup + that round trip comfortably exceeds the default 30s test budget.
        test.setTimeout(60000);

        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        await test.step(testInfo.project.name + ": fill and submit the VT form", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
            await adminVirtualTerminalPage.fillNewCustomerName(customerData.firstName, customerData.lastName);
            await adminVirtualTerminalPage.fillPaymentDetails('5.00', 'INV-010-TEST');
            await adminVirtualTerminalPage.submitWithTestPaymentMethod('pm_card_visa');
        });

        await adminVirtualTerminalPage.assertPaymentPlaced();
        await expect(page.url()).toMatch(/sales\/order\/view/);
    });

    // @story: vt-order-tagged-is-virtual-terminal
    test("it records is_virtual_terminal=1 on the created order", async ({adminVirtualTerminalPage, adminOrdersPage}, testInfo) => {
        // Places a VT payment (real Stripe API round trip), then a second navigation to
        // the orders grid (ElasticSuite-backed grid load is slow on this instance) —
        // exceeds the default 30s test budget.
        test.setTimeout(150000);

        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        await test.step(testInfo.project.name + ": place a VT payment", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
            await adminVirtualTerminalPage.fillNewCustomerName(customerData.firstName, customerData.lastName);
            await adminVirtualTerminalPage.fillPaymentDetails('5.00');
            await adminVirtualTerminalPage.submitWithTestPaymentMethod('pm_card_visa');
            await adminVirtualTerminalPage.assertPaymentPlaced();
        });

        // The success message ("Payment placed as order #<increment_id>") carries the
        // increment id — the order view page title shows the same. Extract it, then reuse
        // the grid's Virtual Terminal column (009, covered generically by
        // orders-grid-virtual-terminal.spec.ts) to confirm THIS specific order is tagged.
        const successText = await page.locator(locators.admin_success_message).textContent();
        const incrementId = successText?.match(/order #(\S+)\.?/i)?.[1]?.replace(/\.$/, '');
        expect(incrementId).toBeTruthy();

        await adminOrdersPage.navigateTo();
        await adminOrdersPage.checkIfOrderExistsByIncrementId(incrementId as string);

        const orderRow = page.locator('.data-grid tbody tr').filter({hasText: incrementId as string}).first();
        await expect(orderRow).toContainText('Yes');
    });

    // @story: vt-pay-button-disables-after-first-click
    test("it disables the Pay button after the first click", async ({adminVirtualTerminalPage}, testInfo) => {
        const page = adminVirtualTerminalPage.page;
        const customerData = await createCustomerData(process.env.faker_locale);

        await test.step(testInfo.project.name + ": fill valid details", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
            await adminVirtualTerminalPage.fillNewCustomerName(customerData.firstName, customerData.lastName);
            await adminVirtualTerminalPage.fillPaymentDetails('5.00');
        });

        // Real Stripe tokenization is flaky in this environment (iframe) — this test only
        // needs the synchronous disable-on-click behaviour, not a completed payment.
        await adminVirtualTerminalPage.clickPay();
        await expect(page.locator(locators.pay_button)).toBeDisabled();
    });
});
