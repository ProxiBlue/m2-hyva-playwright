import BasePage from "@common/pages/base.page";
import {Page, Route, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/virtualTerminal.locator";
import {loadJsonData} from "@utils/functions/file";

const data = loadJsonData('virtualTerminal.data.json', 'admin', {"default": {}});

/**
 * Matches the PaymentMethods AJAX endpoint (002) regardless of the `key/<secret>/`
 * segment Magento's backend URL builder appends — see Form::getOrderDataJson().
 */
const PAYMENT_METHODS_ENDPOINT_PATTERN = /virtualterminal\/index\/paymentmethods/i;

/**
 * Matches the CustomerLookup AJAX endpoint (009) — mocked in task 004's saved-card specs
 * so rendering/toggle coverage doesn't depend on a real Stripe-backed customer existing
 * (task 005 hasn't wired card-saving yet).
 */
const CUSTOMER_LOOKUP_ENDPOINT_PATTERN = /virtualterminal\/index\/customerlookup/i;

export type SavedCard = {
    id: string;
    brand: string;
    last4: string;
    exp: string;
    exp_month?: number;
    exp_year?: number;
};

export type PastOrderCard = {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    source?: string;
};

export default class AdminVirtualTerminalPage extends BasePage {
    /**
     * POST bodies of every intercepted PaymentMethods call, in call order — populated by
     * whichever `mock*`/`trackPaymentMethodsCalls()` helper below was installed. No saved
     * cards exist for real customers yet (task 005 owns actually saving them), so task
     * 004's rendering/toggle coverage mocks this endpoint's response at the network layer
     * rather than depending on real Stripe-backed fixture data.
     */
    private paymentMethodsCalls: string[] = [];

    constructor(public page: Page, public workerInfo: TestInfo) {
        super(page, workerInfo, data, locators);
    }

    /**
     * Admin GET links carry a route-scoped secret key (Magento\Backend\App\Request\
     * BackendValidator) — a raw page.goto() to a hardcoded virtualterminal/index/index
     * URL gets redirected back to the Dashboard because it lacks that key (confirmed via
     * manual curl verification against this task). Extract the real rendered menu href
     * instead, same pattern AdminOrdersPage.navigateTo() uses for the orders grid link.
     *
     * Waits for 'attached', not 'visible': this admin instance has enough top-level menu
     * groups (Wyomind/Amasty/ShipperHQ/etc.) that the sidebar's own overflow collapsing
     * pushes "Payments" behind a "Show More" toggle on some viewports — the <a href> is
     * still server-rendered in the DOM either way, and getAttribute() doesn't need the
     * element to be visually visible, only present.
     */
    async navigateTo() {
        const takePaymentLink = this.page.locator(locators.take_payment_menu_item).locator('a');
        await takePaymentLink.waitFor({state: 'attached'});
        const href = await takePaymentLink.getAttribute('href');

        await test.step(
            this.workerInfo.project.name + ": Go to " + href,
            async () => await this.page.goto(href ?? '')
        );
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForSelector(locators.email_input, {state: 'visible'});
    }

    async fillEmail(email: string) {
        await test.step(
            this.workerInfo.project.name + ": Fill email " + email,
            async () => {
                await this.page.fill(locators.email_input, email);
                // The lookup fires on blur (500ms debounce) — move focus off the field.
                await this.page.locator(locators.email_input).blur();
            });
    }

    /**
     * Fills the email field WITHOUT blurring — used to assert the immediate (pre-lookup)
     * saved-card state reset independently of the next debounced lookup round trip.
     */
    async updateEmail(email: string) {
        await this.page.fill(locators.email_input, email);
    }

    /**
     * Mocks the CustomerLookup endpoint (009) so saved-card rendering/toggle coverage
     * doesn't depend on a real customer round trip.
     */
    async mockCustomerLookup(exists: boolean, firstname = '', lastname = '') {
        await this.page.route(CUSTOMER_LOOKUP_ENDPOINT_PATTERN, async (route: Route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({exists, firstname, lastname}),
            });
        });
    }

    /**
     * Waits for the CustomerLookup AJAX round-trip to reveal the post-lookup fieldset
     * (gotcha #5) — covers both the "unknown email" and "existing customer" outcomes.
     *
     * Not using waitForLoadState('networkidle') here — several installed extensions on
     * this admin instance (Wyomind's discover_* calls, Amasty) poll in the background
     * indefinitely, so 'networkidle' can stall well past the lookup actually completing.
     * The element wait below is the real readiness signal.
     */
    async waitForLookupReveal() {
        await this.page.locator(locators.post_lookup_fields).waitFor({state: 'visible', timeout: 20000});
    }

    async fillPaymentDetails(amount: string, invoiceNumber?: string) {
        await this.page.fill(locators.amount_input, amount);

        if (invoiceNumber) {
            await this.page.fill(locators.invoice_number_input, invoiceNumber);
        }
    }

    async fillNewCustomerName(firstName: string, lastName: string) {
        await this.page.fill(locators.firstname_input, firstName);
        await this.page.fill(locators.lastname_input, lastName);
    }

    /**
     * Sets the Stripe PaymentMethod id directly on the hidden payment[payment_method]
     * input and submits the native form — bypasses the real Stripe card-element/iframe
     * tokenizer entirely (flaky per project_stripe_iframe_intermittency), exercising the
     * same server-side path (window.order shim's _submit -> Save controller) a genuine
     * tokenized submission would reach.
     */
    async submitWithTestPaymentMethod(paymentMethodId: string) {
        await test.step(
            this.workerInfo.project.name + ": Submit VT form with test payment method " + paymentMethodId,
            async () => {
                // page.evaluate() can resolve before Playwright's navigation tracking has
                // picked up the frame navigation the native form.submit() inside it just
                // triggered — waiting on waitForNavigation() alongside the evaluate() call
                // (rather than after it) avoids a race against the redirect chain
                // (save -> sales/order/view on success, or back to the VT form on error).
                await Promise.all([
                    this.page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                    this.page.evaluate(({selector, pmId, formId}) => {
                        const input = document.querySelector(selector) as HTMLInputElement | null;

                        if (input) {
                            input.value = pmId;
                        }

                        (document.getElementById(formId) as HTMLFormElement).submit();
                    }, {
                        selector: locators.stripe_payment_method_input,
                        pmId: paymentMethodId,
                        formId: 'edit_form'
                    }),
                ]);

                // Not waiting on 'networkidle' here — the destination is often the sales
                // order view page, which some installed extensions poll in the background
                // indefinitely, so 'networkidle' never resolves. assertPaymentPlaced()'s
                // own explicit element wait is the real readiness signal.
            });
    }

    async clickPay() {
        await this.page.locator(locators.pay_button).click();
    }

    async assertPaymentPlaced() {
        await this.page.locator(locators.admin_success_message).waitFor({state: 'visible', timeout: 60000});
        await expect(this.page.locator(locators.admin_success_message)).toContainText('Payment placed as order');
    }

    // ── Saved-card reuse (task 004) ─────────────────────────────────────────────────

    /**
     * Records every PaymentMethods POST body seen, then lets the real controller (002)
     * handle the request unmodified — used where the test only needs to assert whether/
     * how the endpoint was called, not what it returns.
     */
    async trackPaymentMethodsCalls() {
        this.paymentMethodsCalls = [];
        await this.page.route(PAYMENT_METHODS_ENDPOINT_PATTERN, async (route: Route) => {
            this.paymentMethodsCalls.push(route.request().postData() ?? '');
            await route.continue();
        });
    }

    /**
     * Intercepts the PaymentMethods call and fulfills it with a synthetic response matching
     * the real JSON contract (PaymentMethods.php class docblock): `{savedCards, pastOrderCards,
     * hasAnyCards, hasSavedCards}`. `pastOrderCards` defaults to `[]` for task 004/005's
     * customer-linked-only specs; task 011's past-orders-group specs pass it explicitly.
     */
    async mockPaymentMethods(hasSavedCards: boolean, cards: SavedCard[] = [], pastOrderCards: PastOrderCard[] = []) {
        this.paymentMethodsCalls = [];
        await this.page.route(PAYMENT_METHODS_ENDPOINT_PATTERN, async (route: Route) => {
            this.paymentMethodsCalls.push(route.request().postData() ?? '');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    savedCards: cards,
                    pastOrderCards: pastOrderCards,
                    hasAnyCards: hasSavedCards || pastOrderCards.length > 0,
                    hasSavedCards,
                }),
            });
        });
    }

    /**
     * Simulates the PaymentMethods call failing outright (network/server error) —
     * exercises the graceful-degradation path (today's new-card-only behaviour).
     */
    async mockPaymentMethodsFailure() {
        this.paymentMethodsCalls = [];
        await this.page.route(PAYMENT_METHODS_ENDPOINT_PATTERN, async (route: Route) => {
            this.paymentMethodsCalls.push(route.request().postData() ?? '');
            await route.abort('failed');
        });
    }

    getPaymentMethodsCallCount(): number {
        return this.paymentMethodsCalls.length;
    }

    getLastPaymentMethodsCallBody(): string {
        return this.paymentMethodsCalls[this.paymentMethodsCalls.length - 1] ?? '';
    }

    async waitForSavedCardsReveal() {
        await this.page.locator(locators.saved_cards_block).waitFor({state: 'visible', timeout: 20000});
    }

    async getSavedCardLabelsText(): Promise<string[]> {
        return this.page.locator(`${locators.saved_cards_list} label`).allTextContents();
    }

    async selectSavedCardSource() {
        await this.page.locator(locators.payment_source_saved_radio).check();
    }

    async selectNewCardSource() {
        await this.page.locator(locators.payment_source_new_radio).check();
    }

    async selectSavedCardByIndex(index: number) {
        await this.page.locator(locators.saved_card_choice_radios).nth(index).check();
    }

    async getSavedPaymentMethodValue(): Promise<string> {
        return this.page.locator(locators.saved_payment_method_input).inputValue();
    }

    // ── Past-orders picker (guest-vault reuse — task 011) ───────────────────────

    async waitForPastOrderCardsReveal() {
        await this.page.locator(locators.past_order_cards_heading).waitFor({state: 'visible', timeout: 20000});
    }

    async getPastOrderCardLabelsText(): Promise<string[]> {
        return this.page.locator(`${locators.past_order_cards_list} label`).allTextContents();
    }

    async selectPastOrderCardByIndex(index: number) {
        await this.page.locator(locators.past_order_card_choice_radios).nth(index).check();
    }

    /**
     * Submits the VT form via the Pay button for a card already selected via
     * `selectSavedCardByIndex()`/`selectPastOrderCardByIndex()` — the saved/past-order flow
     * posts natively (window.order._submit()) with no Stripe tokenizer/iframe involved, see
     * virtual-terminal.js's payButton click handler.
     */
    async submitWithSelectedCard() {
        await test.step(
            this.workerInfo.project.name + ": Submit VT form with the selected saved/past-order card",
            async () => {
                await Promise.all([
                    this.page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                    this.page.locator(locators.pay_button).click(),
                ]);
            });
    }
}
