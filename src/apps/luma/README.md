# Luma Theme Tests

This is the **Luma** app within the m2-hyva-playwright test suite. It provides end-to-end tests for Magento 2 stores using the default Luma theme (vanilla Magento frontend with KnockoutJS).

## Architecture

The test suite is organized into "apps" — each app represents a different frontend theme or project:

```
src/apps/
├── hyva/       # Base Hyvä theme tests (shared)
├── luma/       # Luma/vanilla Magento tests (this app)
├── admin/      # Admin panel tests (shared)
├── checkout/   # Checkout tests (shared)
├── pps/        # Project-specific: PVC Pipe Supplies
└── ...         # Other project-specific apps
```

The Luma app can be used standalone or extended by project-specific apps that use the Luma theme.

## Configuration

Before running tests, update `config.json`:

```json
{
  "url": "https://your-luma-store.test/",
  "mailcatcher": "",
  "skipBaseTests": {},
  "faker_locale": "en_US"
}
```

Update test data files in `data/` to match products in your catalog:

- `simple_product.data.json` — Product used for cart/checkout tests
- `cart.data.json` — Cart page configuration
- `customer.data.json` — Customer account page configuration

## Running Tests

```bash
# Run all Luma tests
APP_NAME=luma npx playwright test --project=chromium

# Run specific test file
APP_NAME=luma npx playwright test cart.spec.ts

# Run with UI mode
APP_NAME=luma npx playwright test --ui
```

## Test Coverage

| Test File | Description |
|-----------|-------------|
| `cart.spec.ts` | Cart operations: add, update qty, delete, verify totals |
| `checkout.spec.ts` | Guest checkout with various payment methods |
| `customer.spec.ts` | Account creation and login |

## Key Differences from Hyvä

Luma uses vanilla Magento frontend technologies:

- **KnockoutJS** for UI components (vs Alpine.js in Hyvä)
- **RequireJS** for module loading
- **jQuery** for DOM manipulation
- **Standard Magento checkout** (multi-step KO-based)

Locators in this app target Luma-specific selectors rather than Hyvä's Alpine.js bindings.

## Extending for Projects

To create project-specific Luma tests:

1. Create a new app directory: `src/apps/your-project/`
2. Set `TEST_BASE=luma` in your playwright config to inherit Luma tests
3. Override locators/data as needed for your catalog
4. Add project-specific test files

## Requirements

- Magento 2 instance with Luma theme
- Sample data or products matching test data files
- Payment methods enabled: Check/Money Order, Bank Transfer, Cash on Delivery
- Flat rate shipping enabled
