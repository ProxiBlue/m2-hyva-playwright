import BasePage from "@common/pages/base.page";
import {Page, TestInfo, expect, test} from "@playwright/test";
import * as locators from "@admin/locators/virtualTerminal.locator";
import {loadJsonData} from "@utils/functions/file";

const data = loadJsonData('virtualTerminal.data.json', 'admin', {"default": {}});

export default class AdminVirtualTerminalPage extends BasePage {
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
}
