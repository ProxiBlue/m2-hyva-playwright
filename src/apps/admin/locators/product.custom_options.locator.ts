// Admin Product Custom Options Locators
// For managing custom options with qty limits

// Product Grid
export const products_grid = '.admin__data-grid-wrap';
export const products_grid_search = '[data-part="search-field"]';
export const products_grid_search_submit = '[data-action="grid-filter-apply"]';
export const products_grid_first_row = '.data-row:first-child';
export const products_grid_edit_link = '.data-row:first-child .action-menu-item';

// Product Edit Page
export const product_form = '#product_form';
export const product_form_tabs = '#product_info_tabs';

// Custom Options Tab
export const custom_options_tab = '[data-index="custom_options"]';
export const custom_options_container = '[data-index="container_option"]';
export const add_option_button = 'button[data-index="button_add"]';

// Custom Option Form Fields
export const option_type_container = '[data-index="type"]';
export const option_type_select = '[data-index="type"] select';
export const option_title_input = 'input[name*="[title]"]';
export const option_is_required_checkbox = 'input[name*="[is_require]"]';

// Qty Limit Field (option level)
export const option_qty_limit_container = '[data-index="qty_limit"]';
export const option_qty_limit_input = 'input[name*="[qty_limit]"]';
export const option_qty_limit_label = '[data-index="qty_limit"] label';
export const option_qty_limit_notice = '[data-index="qty_limit"] .admin__field-note';

// Option Values (for dropdown, radio, checkbox, multiple)
// NOTE: Must be more specific than add_option_button to avoid clicking "Add Option" instead of "Add Value"
export const add_value_button = '[data-index="values"] button[data-index="button_add"]';
export const option_values_container = '[data-index="values"]';
export const option_value_row = '[data-index="record"]';
export const option_value_title_input = 'input[name*="[title]"]';
export const option_value_price_input = 'input[name*="[price]"]';

// Qty Limit Field (value level)
// Note: Value qty_limit inputs have name like: product[options][1][values][0][qty_limit]
export const value_qty_limit_container = '[data-index="qty_limit"]';
export const value_qty_limit_input = 'input[name*="[values]"][name*="[qty_limit]"]';

// Save Product
export const save_button = '#save-button';
export const save_and_continue_button = '#save_and_edit_button';
export const success_message = '.message-success';
export const error_message = '.message-error';

// Product Name in Header
export const product_name_header = '.page-title';
