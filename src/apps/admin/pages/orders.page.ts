import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/orders.locator";
import {CustomerData} from '@common/interfaces/CustomerData';
import * as CustomerFormLocators from "../locators/orderCustomerForm.locator";
import { loadJsonData } from "@utils/functions/file";

// Load the orders data using the utility function
const data = loadJsonData('orders.data.json', 'admin', {"default": {}});
export default class AdminOrdersPage extends BasePage {
    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators); // pass the data and locators to teh base page class
    }

    /**
     * Wait for the admin grid loading spinner to disappear
     */
    private async waitForGridSpinner() {
        const gridSpinner = this.page.locator('.admin__data-grid-loading-mask');
        try {
            // Check if spinner is visible, if so wait for it to disappear
            const isSpinnerVisible = await gridSpinner.isVisible();
            if (isSpinnerVisible) {
                await gridSpinner.waitFor({state: 'hidden', timeout: 30000});
            }
        } catch (e) {
            // Spinner may not be present - continue
        }
    }

    async navigateTo() {
        // get the orders url from admin dashboard (need the key value)
        const orderListItem = this.page.locator(locators.orders_list_item);
        const orderLink = orderListItem.locator('a');
        const hrefValue = await orderLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + hrefValue,
            async () => await this.page.goto(hrefValue ?? '')
        );
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");

        // Wait for grid spinner to disappear before interacting
        await this.waitForGridSpinner();

        // Bounded — the default 30s Playwright timeout hits the test budget cap under
        // concurrent admin load (ui_bookmark row lock stalls first grid render). The
        // callers' retry loops reload and re-check, so we surface a failure fast
        // instead of consuming the whole test budget on one stuck render.
        await this.page.waitForSelector(locators.adminOrdersGrid + ' >> tr', { timeout: 45000 }).catch(() => {});

        // sometimes we have filters left over from prior sessions, so clear them.
        // Force-click and bound the timeout: under concurrent admin load the grid
        // loading mask can stay up and intercept pointer events indefinitely (a plain
        // click waits for actionability and hangs the whole test). checkIfOrderExists
        // reloads and retries, so a stuck mask here is non-fatal.
        try {
            const chip = this.page.locator(locators.remove_filter_button).first();
            if (await chip.isVisible({ timeout: 2000 }).catch(() => false)) {
                await chip.click({ force: true, timeout: 5000 });
                await this.waitForGridSpinner();
            }
        } catch (e) {
            // grid mask stuck under load — leave it; the caller reloads and retries
        }
    }

    /**
     * Dismiss any "Something went wrong" admin modal that concurrent admin sessions
     * can trigger when the ui_bookmark table is locked. Returns true if dialog was dismissed.
     */
    private async dismissAdminAttentionDialog(): Promise<boolean> {
        const dialog = this.page.locator('.modal-popup button:has-text("OK"), .modal-popup button[data-role="closeBtn"]').first();
        const visible = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
        if (visible) {
            await dialog.click();
            await this.page.waitForTimeout(500);
            return true;
        }
        return false;
    }

    async checkIfOrderExistsByIncrementId(incrementId: string) {
        await test.step(
            this.workerInfo.project.name + ": Check if order exists by increment id ",
            async () => {
                const ordersUrl = this.page.url();
                const orderRow = () => this.page
                    .locator(".data-grid tbody tr")
                    .filter({ hasText: incrementId })
                    .first();

                // Use the Filters panel with an exact increment_id filter rather than the
                // keyword-search bar. The keyword search fuzzy-matches and renders
                // asynchronously — under concurrent load it returned a *different* order
                // (e.g. searching P83776 surfaced the stale P83774 while the grid was
                // still loading). The Filters panel filters sales_order_grid.increment_id
                // directly via SQL, so the match is exact and immediate. Verified present
                // in Mage-OS 3.2.0 (filter field name "increment_id").
                //
                // The grid loading mask can get stuck under concurrent admin sessions, so
                // each retry reloads the orders page to give the grid a fresh render.
                for (let attempt = 0; attempt < 4; attempt++) {
                    if (attempt > 0) {
                        await this.page.goto(ordersUrl, { waitUntil: 'domcontentloaded' });
                    }
                    await this.page.waitForLoadState("networkidle").catch(() => {});
                    await this.dismissAdminAttentionDialog();
                    await this.waitForGridSpinner();

                    // Clear any leftover filter chips from prior sessions
                    const chip = this.page.locator(locators.remove_filter_button).first();
                    if (await chip.isVisible({ timeout: 2000 }).catch(() => false)) {
                        await chip.click({ force: true, timeout: 5000 }).catch(() => {});
                        await this.waitForGridSpinner();
                    }

                    // Apply exact increment_id filter via the Filters panel
                    const expand = this.page.locator(locators.filter_button_expand).first();
                    if (await expand.isVisible({ timeout: 15000 }).catch(() => false)) {
                        // Poll expand up to 3 times — a stuck loading mask under
                        // concurrent load can swallow the click without state change.
                        // Panel is confirmed open when a visible increment_id input exists.
                        let panelOpen = false;
                        for (let i = 0; i < 3 && !panelOpen; i++) {
                            await expand.click({ force: true });
                            panelOpen = await this.page
                                .locator(locators.filter_increment_id)
                                .locator('visible=true')
                                .first()
                                .isVisible({ timeout: 4000 })
                                .catch(() => false);
                        }
                        if (panelOpen) {
                            const field = this.page.locator(locators.filter_increment_id).locator('visible=true').first();
                            await field.fill(incrementId);
                            await this.page.locator(locators.filter_apply).first().click({ force: true });
                            await this.waitForGridSpinner();
                            await this.page.waitForLoadState("networkidle").catch(() => {});
                        }
                        // If panel refused to open, fall through — the retry loop reloads.
                    }

                    // Poll for the exact row OR an attention dialog (dismiss → reload → retry)
                    const deadline = Date.now() + 15000;
                    while (Date.now() < deadline) {
                        if (await this.dismissAdminAttentionDialog()) {
                            await this.waitForGridSpinner();
                            break; // reload + re-filter on next attempt
                        }
                        if (await orderRow().isVisible({ timeout: 300 }).catch(() => false)) {
                            return;
                        }
                        await this.page.waitForTimeout(500);
                    }
                }

                // Final assertion after all attempts
                await expect(
                    orderRow(),
                    `Order ${incrementId} not found in admin grid after retries`,
                ).toBeVisible({ timeout: 15000 });
            });
    }

    /**
     * Creates an order in admin and creates a new customer for that order.
     * note that faker will spew out random countries even when locale is set.
     * so country is not included below and should be handled in test for population to
     * desired value
     * @param customerData
     */
    async createNewOrderWithNewCustomer(customerData: CustomerData) {
        await this.page.locator(locators.create_new_order_button).waitFor({state: 'visible'});
        await this.page.click(locators.create_new_order_button);
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForLoadState("networkidle");

        await this.page.getByRole('button', {name: locators.create_new_customer_button}).click();
        await this.page.waitForLoadState("networkidle");

        // Handle store selection page (appears when multiple store views exist)
        const storeSelectHeading = this.page.getByText('Please select a store');
        if (await storeSelectHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Click the first store view radio button (Default Store View)
            await this.page.locator('.tree-store-scope input[type="radio"]').first().click();
            await this.page.waitForLoadState("networkidle");
        }

        await test.step(
            this.workerInfo.project.name + ": Create new order and creating a new customer ",
            async () => {
                // Wait for the form to be fully loaded
                await this.page.waitForSelector(CustomerFormLocators.email, { state: 'visible', timeout: 30000 });
                await this.page.waitForTimeout(1000); // Allow AJAX to complete

                // Fill email and verify it's filled
                await this.page.fill(CustomerFormLocators.email, customerData.email);
                await this.page.waitForTimeout(300);

                // Fill billing address fields
                await this.page.locator(CustomerFormLocators.billing_firstname).waitFor({ state: 'visible' });
                await this.page.fill(CustomerFormLocators.billing_firstname, customerData.firstName);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_lastname, customerData.lastName);
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_street_address, customerData.street_one_line);
                await this.page.waitForTimeout(200);

                // Use fixed Burlington VT address — faker city/state/zip combinations are
                // often geographically mismatched and cause ShipperHQ to return no rates.
                // Vermont 05401 is the same known-good address used in checkout tests.
                await this.page.fill(CustomerFormLocators.billing_city, 'Burlington');
                await this.page.waitForTimeout(200);

                await this.page.locator(CustomerFormLocators.billing_zip).fill('');
                await this.page.locator(CustomerFormLocators.billing_zip).pressSequentially('05401');
                await this.page.waitForTimeout(200);

                await this.page.fill(CustomerFormLocators.billing_phone, customerData.phone);
                await this.page.waitForTimeout(200);

                // Vermont region_id=59 — matches the fixed city/zip above
                await this.page.selectOption(CustomerFormLocators.billing_state, '59');
                await this.page.waitForTimeout(1000);
                await this.page.waitForLoadState("networkidle");
            });
    }

    /**
     * In admin order, add product and then find teh first simple product and add it to the order
     * This eliminates the need for a specific simple t be used, and bypasses need to configure complex product,
     * which will have own function to add and is more specific.
     *
     */
    /**
     * Dismiss the "Configure Product" modal that appears when a product has
     * required custom options or is configurable. Selects the first valid
     * option in every required dropdown and clicks OK.
     */
    private async handleConfigureProductModal() {
        // Wait for the "Configure Product" heading to appear (this is a reliable indicator)
        const configHeading = this.page.locator('h1:has-text("Configure Product"), [data-role="title"]:has-text("Configure Product")');
        try {
            await configHeading.first().waitFor({ state: 'visible', timeout: 5000 });
        } catch {
            return; // No configure modal appeared
        }

        await this.page.waitForTimeout(1000);

        // Scope selects to the configure modal container to avoid matching admin page selects behind the overlay
        const visibleSelects = this.page.locator('#product_composite_configure select:visible');
        const selectCount = await visibleSelects.count();
        for (let i = 0; i < selectCount; i++) {
            const sel = visibleSelects.nth(i);
            const currentValue = await sel.inputValue();
            if (currentValue === '') {
                // Select index 1 (first non-empty option)
                try {
                    await sel.selectOption({ index: 1 });
                    await this.page.waitForTimeout(500);
                } catch {
                    // Option may not exist, continue
                }
            }
        }

        // Click OK button
        const okButton = this.page.getByRole('button', { name: 'OK' });
        if (await okButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await okButton.click();
            await this.page.waitForLoadState("networkidle");
        }
    }

    async selectFirstSimpleProductToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": Find and select first simple product to order ",
            async () => {
                await this.page.click(locators.order_add_products);
                await this.page.waitForSelector(locators.add_product_grid + ' tbody');
                await this.page.waitForLoadState("networkidle");

                const rows = await this.page.$$(locators.add_product_grid + ' tbody tr');
                expect(rows.length).toBeGreaterThan(0);

                let productAdded = false;

                // First pass: find a simple product (no configure link at all)
                for (const row of rows) {
                    // Skip non-shippable placeholder products: the Uptactics
                    // VirtualTerminal MANUAL_PAYMENT item is a virtual $0 product
                    // that sorts first in the grid (newest entity_id) — adding it
                    // removes the shipping section and stalls the checkout flow.
                    const rowText = (await row.textContent()) || '';
                    if (rowText.includes('MANUAL_PAYMENT')) {
                        continue;
                    }
                    const configureLink = await row.$('td:nth-child(2) a.action-configure');

                    if (!configureLink) {
                        const checkbox = await row.$('td.col-select input[type="checkbox"]');
                        if (checkbox) {
                            await checkbox.check();

                            // Even simple products can trigger a configure modal
                            // if they have required custom options
                            await this.handleConfigureProductModal();

                            productAdded = true;
                            break;
                        }
                    }
                }

                // Second pass: if no simple product found, use a configurable product
                if (!productAdded) {
                    for (const row of rows) {
                        const configureLink = await row.$('td:nth-child(2) a.action-configure');
                        if (configureLink && await configureLink.isVisible()) {
                            const checkbox = await row.$('td.col-select input[type="checkbox"]');
                            if (checkbox) {
                                await checkbox.check();
                                await this.handleConfigureProductModal();
                                productAdded = true;
                                break;
                            }
                        }
                    }
                }

                expect(productAdded, 'No product could be added to the order').toBeTruthy();

                await this.page.click(locators.add_product_to_order_button);
                await this.page.waitForLoadState("networkidle");
            });
    }

    /**
     * Select the first shipping method in order create, thus not needing a specifc shipping method,
     * if that is not the specific thing being tested.
     * Existence of shipping methods will have own specific tests
     */
    async selectFirstShippingMethodToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": select first shipping method found ",
            async () => {
                await this.page.click(locators.order_get_shipping_methods);
                // Wait for shipping methods to load (ShipperHQ may be slow)
                await this.page.waitForTimeout(5000);
                await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

                const shippingRadio = this.page.locator('input[name="order[shipping_method]"]').first();
                const radioVisible = await shippingRadio.isVisible().catch(() => false);

                if (radioVisible) {
                    await shippingRadio.check();
                } else {
                    // ShipperHQ returned no rates — fall back to any available radio
                    const anyRadio = this.page.locator('input[type="radio"][name^="order[shipping"]').first();
                    const anyVisible = await anyRadio.isVisible({ timeout: 5000 }).catch(() => false);
                    if (anyVisible) {
                        await anyRadio.check();
                    } else {
                        throw new Error('No shipping methods available for this order. Check ShipperHQ configuration for admin orders.');
                    }
                }
            })
    }

    /**
     * Select teh first payment method in an order if payment is not what is being tested
     * Specific payment methods will have specific tests.
     */
    async selectFirstPaymentMethodToAddToOrder() {
        await test.step(
            this.workerInfo.project.name + ": Select first payment method found ",
            async () => {
                await this.page.locator('input[name="payment[method]"]').first().waitFor({state: 'visible'});
                await this.page.locator('input[name="payment[method]"]').first().check();
            });
    }

    async disableOrderEmailSend() {
        await test.step(
            this.workerInfo.project.name + ": Disable email sending ",
            async () => {
                const checkbox = await this.page.$(locators.send_email_confirmation);
                expect(checkbox).not.toBeNull();
                //@ts-ignore
                await this.page.evaluate(selector => {
                    const checkboxElement = document.querySelector(selector);
                    //@ts-ignore
                    if (checkboxElement && checkboxElement.checked) {
                        //@ts-ignore
                        checkboxElement.checked = false;
                        // Trigger change event if necessary
                        const event = new Event('change', {bubbles: true});
                        checkboxElement.dispatchEvent(event);
                    }
                }, locators.send_email_confirmation);
            });
    }

    /**
     * Submit the admin "Create New Order" form and wait for the server to
     * finish processing it.
     *
     * Signals used (in priority order):
     *   1. Success: Magento's Save controller (vendor/mage-os/module-sales/
     *      Controller/Adminhtml/Order/Create/Save.php) redirects to
     *      sales/order/view/order_id/NNN on success. Waiting for that URL is
     *      the only signal that unambiguously means "order was created".
     *   2. Form error (real): an error is written into #order-errors (the
     *      form-scoped error container, see
     *      vendor/mage-os/module-sales/view/adminhtml/templates/order/create/data.phtml)
     *      OR a validation alert modal is opened by Magento UI (role=alertdialog).
     *      If either appears we fail fast with the actual message.
     *
     * Page-level admin notices (e.g. Amasty Helpdesk's persistent
     * ".message.message-warning" banner above the content area) are NOT
     * inspected, so benign system warnings never cause a false failure.
     *
     * For Pin Payments we also anchor on the tokenization XHR so the
     * place-order click and the subsequent form POST are not conflated by
     * networkidle heuristics.
     */
    async placeOrder() {
        const submitButton = this.page.locator('button:has-text("Submit Order")').first();
        await submitButton.waitFor({ state: 'visible', timeout: 30000 });
        await submitButton.scrollIntoViewIfNeeded();

        // Wait for any payment-form loading mask to clear so the click is not
        // eaten by an in-flight re-render (e.g. after selecting a payment radio).
        await this.page
            .locator('.payment-method-loading-mask, #payment_form_loading')
            .waitFor({ state: 'hidden', timeout: 15000 })
            .catch(() => undefined);

        // If Pin Payments is the active method, it tokenises the card via
        // /pinpayment/checkout/request BEFORE the form POST. Start listening
        // for that XHR now so we catch it even if it resolves quickly.
        const pinTokenize = this.page.waitForResponse(
            r => r.url().includes('/pinpayment/checkout/request'),
            { timeout: 30000 },
        ).catch(() => null);

        // Fire the submit. Use Promise.race between the three possible outcomes:
        //   a) URL redirects to sales/order/view  -> success
        //   b) #order-errors becomes populated    -> real form-level failure
        //   c) alert modal is opened by Magento  -> validation / JS-thrown error
        // We give the server up to 90s to either redirect or surface an error;
        // within the 120s per-test budget that leaves headroom for setup.
        await submitButton.click({ force: true });

        // If Pin, wait for tokenize response and fail fast if Pin itself errored.
        const pinResponse = await pinTokenize;
        if (pinResponse) {
            const pinStatus = pinResponse.status();
            if (pinStatus >= 400) {
                const body = await pinResponse.text().catch(() => '');
                throw new Error(
                    `Pin Payments tokenization failed (HTTP ${pinStatus}): ${body.slice(0, 500)}`,
                );
            }
            // Pin returns 200 with {success: false, message: ...} on card errors.
            try {
                const json = await pinResponse.json();
                if (json && json.success === false) {
                    throw new Error(
                        `Pin Payments rejected the card: ${json.message ?? '(no message)'}`,
                    );
                }
            } catch (e) {
                // Not JSON or already a thrown Error from the branch above.
                if (e instanceof Error && e.message.startsWith('Pin Payments')) {
                    throw e;
                }
            }
        }

        // Race success redirect against visible form-level errors. Each branch
        // is wrapped so that timeout/reject maps to `null` - only the branch
        // whose signal actually fired returns a truthy label, so Promise.race
        // doesn't get hijacked by whichever branch happens to reject first.
        const TIMEOUT_MS = 90000;

        const successUrl = this.page
            .waitForURL(/\/sales\/order\/view\//, { timeout: TIMEOUT_MS })
            .then(() => 'success' as const)
            .catch(() => null);

        const formError = this.page
            .locator('#order-errors .message-error, #order-errors .messages .error-msg')
            .first()
            .waitFor({ state: 'visible', timeout: TIMEOUT_MS })
            .then(() => 'form-error' as const)
            .catch(() => null);

        const modalError = this.page
            .locator('aside.modal-popup._show [role="alertdialog"], .modal-popup.confirm._show, aside._show .modal-content')
            .first()
            .waitFor({ state: 'visible', timeout: TIMEOUT_MS })
            .then(() => 'modal-error' as const)
            .catch(() => null);

        // Use Promise.any so we only act on the first branch that actually
        // resolves to a non-null label. If all three reject (AggregateError),
        // treat as timeout.
        const firstHit = await Promise.any(
            [successUrl, formError, modalError].map(p =>
                p.then(v => (v === null ? Promise.reject() : v)),
            ),
        ).catch(() => null);

        const outcome = firstHit ?? 'timeout';

        if (outcome === 'form-error') {
            const errText = (await this.page.locator('#order-errors').innerText()).trim();
            throw new Error(`Order submission failed (form error): ${errText}`);
        }

        if (outcome === 'modal-error') {
            const modalText = (
                await this.page
                    .locator('aside.modal-popup._show, aside._show .modal-content')
                    .first()
                    .innerText()
                    .catch(() => '')
            ).trim();
            throw new Error(`Order submission failed (modal dialog): ${modalText}`);
        }

        if (outcome === 'timeout') {
            throw new Error(
                `placeOrder(): no success redirect and no error surfaced within 90s. ` +
                `Current URL: ${this.page.url()}`,
            );
        }

        // Success: we are now on the order view page. Assert the confirmation
        // flash message as a final sanity check.
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
            .locator(locators.admin_success_message)
            .waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page.locator(locators.admin_success_message)).toContainText(
            locators.order_success_message,
        );
    }

    async selectPaymentMethodByText(paymentText: string) {
        await test.step(
            this.workerInfo.project.name + ": select payment method:  " + paymentText,
            async () => {
                await this.page.getByText(paymentText).first().waitFor({state: 'visible'});
                await this.page.getByText(paymentText).first().check();
            });
    }

}
