// Uptactics_VirtualTerminal::payments / ::take_payment (etc/adminhtml/menu.xml)
export const payments_menu_item = 'li[data-ui-id="menu-uptactics-virtualterminal-payments"]';
export const take_payment_menu_item = 'li[data-ui-id="menu-uptactics-virtualterminal-take-payment"]';

export const vt_edit_form = '#edit_form';
export const email_input = '#email';

export const post_lookup_fields = '#vt-post-lookup-fields';
export const firstname_field = '#vt-firstname-field';
export const firstname_input = '#vt-firstname';
export const lastname_field = '#vt-lastname-field';
export const lastname_input = '#vt-lastname';
export const existing_customer_field = '#vt-existing-customer-field';
export const existing_customer_name = '#vt-existing-customer-name';

export const amount_input = '#vt-amount';
export const invoice_number_input = '#vt-invoice-number';

export const stripe_payment_fieldset = '#payment_form_stripe_payments';
export const stripe_card_element = '#stripe-card-element';
export const stripe_payment_method_input = 'input[name="payment[payment_method]"]';

export const form_error = '#vt-form-error';
export const pay_button = '#vt-pay-button';

// Saved-card reuse (task 004) — see admin/pages/virtualTerminal.page.ts for the
// mock/interception helpers this spec relies on (no real saved-card data exists yet,
// task 005 owns actually saving cards).
export const saved_cards_block = '#vt-saved-cards';
export const saved_cards_heading = '#vt-saved-cards-heading';
export const saved_cards_list = '#vt-saved-cards-list';
export const payment_source_saved_radio = '#vt-payment-source-saved';
export const payment_source_new_radio = '#vt-payment-source-new';
export const saved_card_choice_radios = 'input[name="vt_saved_card_choice"]';
// VT does not render its own save-card checkbox — it delegates to the
// vendor `StripeIntegration_Payments` child (`virtualterminal_stripe_
// payment_form` → `stripe_payments.phtml` → `select_payment_method.phtml`)
// which renders `<input id="save_payment_method" name="payment[save_payment_method]">`.
// See app/code/Uptactics/VirtualTerminal/README.md ("Saving a new card") and
// Test/Unit/Template/FormTest::it_does_not_render_a_duplicate_save_card_checkbox.
// Points inside `#payment_form_stripe_payments`, so visibility tracks the
// parent fieldset (which VT reveals/hides based on saved-card selection).
export const save_card_field = '#payment_form_stripe_payments #save_payment_method';
export const save_card_checkbox = '#payment_form_stripe_payments #save_payment_method';
export const saved_payment_method_input = 'input[name="payment[vt_saved_payment_method]"]';

// Guest-vault "Cards used on prior orders" group (task 011 — see admin/pages/
// virtualTerminal.page.ts for the mock/DB-seed helpers this group's specs rely on).
export const past_order_cards_heading = '#vt-past-order-cards-heading';
export const past_order_cards_list = '#vt-past-order-cards-list';
export const past_order_card_choice_radios = '#vt-past-order-cards-list input[name="vt_saved_card_choice"]';

export const admin_success_message = '.message.message-success.success';
