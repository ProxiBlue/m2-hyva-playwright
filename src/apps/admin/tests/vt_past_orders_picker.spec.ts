import {describe, test, expect} from "@admin/fixtures";
import * as locators from "@admin/locators/virtualTerminal.locator";
import {shouldSkipTest} from "@utils/functions/test-skip";
import {createCustomerData} from "@common/fixtures/customer";
import {loadJsonData} from "@utils/functions/file";
import {execSync} from "child_process";

/**
 * Task 011 — VT admin "past-orders" picker.
 *
 * After a guest has vaulted a card via the storefront guest-checkout save-card flow
 * (task 005's PersistGuestVaultRow observer writes `uptactics_guest_stripe_customers`,
 * covered by task 010's storefront spec), an operator can look the guest's email up in
 * the Virtual Terminal and reuse that card directly — no re-tokenization, and critically
 * no Magento customer account is required just to see/use the picker.
 *
 * This spec seeds fixture rows directly into `uptactics_guest_stripe_customers` via
 * `mysql` inside the ddev web container (matches
 * checkout_loki_stripe_guest_savecard.spec.ts's DB-read convention) rather than driving a
 * full storefront checkout first — task 010 already covers the storefront vault-write
 * path; this spec covers the ADMIN delta only.
 *
 * Stripe fixture ids: `pm_card_visa` / `pm_card_mastercard` are Stripe's own published
 * test-mode PaymentMethod tokens — globally valid, reusable, and directly chargeable
 * without any prior tokenization/attach step (see virtual-terminal.spec.ts's existing
 * `pm_card_visa` precedent in "it submits a $5 payment ..."). Sandbox-only per graphiti
 * [3c486d1c] — no real `cus_*`/`pm_*` literal appears anywhere in this file. The
 * brand/last4/exp values stored on the seeded row are our own display fixture — the
 * picker renders straight from the DB row and never re-queries Stripe for display
 * metadata, so they need not match whatever Stripe itself has on file for that token.
 *
 * Admin-touching suite policy per memory `project_playwright_worker_policy.md`:
 * runs single-worker (see admin app's package.json test:admin script), same as the
 * sibling virtual-terminal.spec.ts describe blocks.
 */

interface GuestVaultCardFixture {
    pm_id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
}

const data = loadJsonData('virtualTerminal.data.json', 'admin', {default: {}}) as {
    default: {
        past_order_cards_fixture: {
            display: GuestVaultCardFixture;
            capture: GuestVaultCardFixture;
        };
    };
};

/** Placeholder only — never read by Save.php/PastOrderCardProvider, satisfies the NOT NULL column. */
const STRIPE_CUSTOMER_ID_PLACEHOLDER = 'cus_test_vt_fixture';

/** Direct DB access inside the ddev web container — ground truth, matches project convention. */
function dbValue(sql: string): string {
    return execSync(`mysql -sN -e ${JSON.stringify(sql)}`, {
        encoding: 'utf-8',
        timeout: 15000,
    }).trim();
}

function dbExec(sql: string): void {
    execSync(`mysql -e ${JSON.stringify(sql)}`, {
        encoding: 'utf-8',
        timeout: 15000,
    });
}

function escapeSql(value: string): string {
    return value.replace(/'/g, "''");
}

function getStripeTestPublishableKey(): string {
    return dbValue(
        "SELECT value FROM core_config_data WHERE path = 'payment/stripe_payments_basic/stripe_test_pk'",
    );
}

function insertGuestVaultRow(email: string, card: GuestVaultCardFixture): void {
    const publishableKey = getStripeTestPublishableKey();

    dbExec(
        'INSERT INTO uptactics_guest_stripe_customers ' +
        '(email, publishable_key, stripe_customer_id, pm_id, brand, last4, exp_month, exp_year, created_at) ' +
        `VALUES ('${escapeSql(email)}', '${escapeSql(publishableKey)}', '${STRIPE_CUSTOMER_ID_PLACEHOLDER}', ` +
        `'${escapeSql(card.pm_id)}', '${escapeSql(card.brand)}', '${escapeSql(card.last4)}', ` +
        `${card.exp_month}, ${card.exp_year}, NOW())`,
    );
}

function deleteGuestVaultRowsForEmail(email: string): void {
    dbExec(`DELETE FROM uptactics_guest_stripe_customers WHERE email = '${escapeSql(email)}'`);
}

function magentoCustomerCount(email: string): number {
    const out = dbValue(`SELECT COUNT(*) FROM customer_entity WHERE email = '${escapeSql(email)}'`);
    return parseInt(out, 10) || 0;
}

describe("Admin - Virtual Terminal Take Payment form - past-orders picker", () => {
    let seededEmails: string[] = [];

    test.beforeEach(async ({adminPage, adminVirtualTerminalPage}, testInfo) => {
        test.skip(process.env.APP_NAME === 'hyva' || process.env.TEST_BASE === 'hyva',
            'Admin tests require admin access - skipped for hyva environment');

        const shouldSkip = shouldSkipTest(testInfo);
        test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);

        seededEmails = [];

        await adminPage.navigateTo();
        await adminPage.login();
        await adminVirtualTerminalPage.navigateTo();
    });

    test.afterEach(async ({adminPage}) => {
        for (const email of seededEmails) {
            deleteGuestVaultRowsForEmail(email);
        }
        seededEmails = [];

        // See virtual-terminal.spec.ts's sibling afterEach comment: landing back on
        // Dashboard first keeps logout() on the page shape it was written for.
        await adminPage.navigateTo();
        await adminPage.logout();
    });

    // @story: vt-past-orders-group-displays-with-guest-vault-row
    test("it displays the past-orders group in VT picker when the queried email has a guest-vault row", async ({adminVirtualTerminalPage}) => {
        const customerData = await createCustomerData(process.env.faker_locale);
        const card = data.default.past_order_cards_fixture.display;

        insertGuestVaultRow(customerData.email, card);
        seededEmails.push(customerData.email);

        await adminVirtualTerminalPage.fillEmail(customerData.email);
        await adminVirtualTerminalPage.waitForLookupReveal();
        await adminVirtualTerminalPage.waitForPastOrderCardsReveal();

        const labels = await adminVirtualTerminalPage.getPastOrderCardLabelsText();
        expect(labels).toHaveLength(1);
        expect(labels[0]).toContain(card.brand);
        expect(labels[0]).toContain(card.last4);
    });

    // @story: vt-past-orders-group-hidden-without-guest-vault-row
    test("it does not display the past-orders group when the queried email has no guest-vault row", async ({adminVirtualTerminalPage}) => {
        const customerData = await createCustomerData(process.env.faker_locale);

        await adminVirtualTerminalPage.fillEmail(customerData.email);
        await adminVirtualTerminalPage.waitForLookupReveal();

        // No reveal signal exists for "the group stayed hidden" — a short settle window
        // gives the PaymentMethods round trip the chance to complete before asserting.
        await adminVirtualTerminalPage.page.waitForTimeout(1500);

        await expect(adminVirtualTerminalPage.page.locator(locators.past_order_cards_heading)).toBeHidden();
        await expect(adminVirtualTerminalPage.page.locator(locators.saved_cards_block)).toBeHidden();
    });

    // @story: vt-past-orders-writes-hidden-field
    test("it writes the selected past-order pm_id into payment[vt_saved_payment_method] hidden input", async ({adminVirtualTerminalPage}) => {
        const customerData = await createCustomerData(process.env.faker_locale);
        const card = data.default.past_order_cards_fixture.display;

        insertGuestVaultRow(customerData.email, card);
        seededEmails.push(customerData.email);

        await adminVirtualTerminalPage.fillEmail(customerData.email);
        await adminVirtualTerminalPage.waitForLookupReveal();
        await adminVirtualTerminalPage.waitForPastOrderCardsReveal();

        await adminVirtualTerminalPage.selectSavedCardSource();
        await adminVirtualTerminalPage.selectPastOrderCardByIndex(0);

        expect(await adminVirtualTerminalPage.getSavedPaymentMethodValue()).toBe(card.pm_id);
    });

    // @story: vt-past-orders-captures-without-retokenization
    test("it captures a payment against the reused pm_id without re-tokenization", async ({adminVirtualTerminalPage}, testInfo) => {
        // Save (015) makes a real server-side Stripe capture call — form fill + lookup +
        // that round trip comfortably exceeds the default 30s test budget.
        test.setTimeout(60000);

        const customerData = await createCustomerData(process.env.faker_locale);
        const card = data.default.past_order_cards_fixture.capture;

        insertGuestVaultRow(customerData.email, card);
        seededEmails.push(customerData.email);

        await test.step(testInfo.project.name + ": look up the guest-vault email and select its past-order card", async () => {
            await adminVirtualTerminalPage.fillEmail(customerData.email);
            await adminVirtualTerminalPage.waitForLookupReveal();
            await adminVirtualTerminalPage.waitForPastOrderCardsReveal();
            // Unknown to Magento — the guest-vault row is email-keyed only (no customer
            // account exists yet), so name fields are required same as any brand-new customer.
            await adminVirtualTerminalPage.fillNewCustomerName(customerData.firstName, customerData.lastName);
            await adminVirtualTerminalPage.fillPaymentDetails('5.00');
            await adminVirtualTerminalPage.selectSavedCardSource();
            await adminVirtualTerminalPage.selectPastOrderCardByIndex(0);
        });

        // Stripe fieldset must stay hidden throughout — no tokenizer/iframe interaction at
        // all proves this submission never re-tokenizes a new card.
        await expect(adminVirtualTerminalPage.page.locator(locators.stripe_payment_fieldset)).toBeHidden();

        await adminVirtualTerminalPage.submitWithSelectedCard();
        await adminVirtualTerminalPage.assertPaymentPlaced();
    });

    // @story: vt-past-orders-lookup-no-customer-created
    test("it does not create a Magento customer during picker lookup for an unknown email", async ({adminVirtualTerminalPage}) => {
        const customerData = await createCustomerData(process.env.faker_locale);
        const card = data.default.past_order_cards_fixture.display;

        insertGuestVaultRow(customerData.email, card);
        seededEmails.push(customerData.email);

        expect(magentoCustomerCount(customerData.email)).toBe(0);

        await adminVirtualTerminalPage.fillEmail(customerData.email);
        await adminVirtualTerminalPage.waitForLookupReveal();
        await adminVirtualTerminalPage.waitForPastOrderCardsReveal();

        // Lookup + PaymentMethods round trips only — no submission. Confirms the picker's
        // read paths (CustomerLookup, PaymentMethods/PastOrderCardProvider) never create a
        // Magento customer as a side effect of merely viewing the picker.
        expect(magentoCustomerCount(customerData.email)).toBe(0);
    });
});
