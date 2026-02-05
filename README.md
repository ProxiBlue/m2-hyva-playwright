# Magento 2 Hyva Playwright Tests

## Introduction

An extensible Playwright testing framework for Magento 2 + Hyva projects.

* A base set of Hyva tests that can be extended/updated without affecting site-specific tests
* Site-specific tests layered on top of the base via separate app directories
* Updating the base tests does not cause merge conflicts with your site tests

## Architecture

### App Structure

Tests are organized as **apps** under `src/apps/`. Each app is an independent yarn workspace:

```
src/apps/
  hyva/       # Base Hyva storefront tests
  admin/      # Admin panel tests (orders, products)
  checkout/   # Checkout flow tests (Luma, Braintree)
  luma/       # Luma theme tests
  pps/        # Example site-specific app
  nto/        # Example site-specific app
```

Apps can reference each other using path aliases:
- `@hyva` - base Hyva app
- `@admin` - admin app
- `@checkout` - checkout app
- `@common` - shared utilities
- `@utils` - utility functions

### Key Concepts

**`APP_NAME`** - Determines which app provides data files, locators, and configuration overrides.

**`TEST_BASE`** - Determines which app's test specs to run.

Running `APP_NAME=pps TEST_BASE=hyva npx playwright test` runs the base Hyva test specs, but uses PPS data files, locators, and config where PPS provides overrides.

### Data and Locator Override Mechanism

The framework uses `loadJsonData()` and `loadLocators()` from `@utils/functions/file` to resolve files:

1. Check if a file exists in the `APP_NAME` app directory
2. If found, use it (or merge it, for locators)
3. Otherwise, fall back to the base app directory

**Data files**: The APP_NAME version completely replaces the base version. Create a JSON file with the same name in your app's `data/` directory.

**Locator files**: The APP_NAME version is **merged** with the base version. Only export the locators you want to override; the rest are inherited from the base.

```typescript
// src/utils/functions/file.ts - loadLocators merges via spread:
return { ...baseLocators, ...appLocators };
```

### Page Object Model

The framework follows POM (Page Object Model). Page interactions live in `pages/` classes, test assertions live in `tests/` spec files. App-specific page classes extend base Hyva page classes to reuse or override behavior.

## Admin & Checkout Apps

* The **admin** app provides pages/fixtures for admin panel testing (order creation, product management)
* The **checkout** app provides pages/fixtures for checkout flows. The included checkout app tests Luma checkout (with Braintree). Since Hyva is checkout-independent, checkout is a separate app — replace or extend `src/apps/checkout/` with tests for whichever checkout your site uses (Hyva checkout, React checkout, etc.)

### Admin Authentication

Admin tests require credentials in `config.private.json`:

```json
{
  "admin_path": "admin",
  "admin_username": "your_admin_username",
  "admin_password": "your_admin_password"
}
```

For parallel test execution, enable admin account sharing:

**Admin > Stores > Configuration > Advanced > Admin > Security > Admin Account Sharing = Yes**

For details, see [Admin Authentication Configuration](./ADMIN_AUTH_SOLUTION.md).

#### Bulk Admin Account Creation (Optional)

For parallel admin testing, helper scripts can create multiple admin accounts:

```bash
# Direct Magento CLI (run inside container)
./admin-users.sh create --count=5 --password=secure123
./admin-users.sh remove

# Via DDEV
./setup-test-admins.sh create --count=5 --password=secure123
./setup-test-admins.sh remove
```

These scripts are **not** run automatically. Admin credentials must be configured in `config.private.json` before running tests.

## Configuration

### config.json

Site URLs, test skip configuration, locale settings:

```json
{
  "url": "https://your-site.ddev.site/",
  "faker_locale": "en_US",
  "currency_symbol": "$",
  "skipBaseTests": {
    "Suite Name": ["Test title to skip"]
  }
}
```

### config.private.json

Sensitive data (not committed to git): admin credentials, API keys.

```json
{
  "admin_path": "admin",
  "admin_username": "your_admin_username",
  "admin_password": "your_admin_password",
  "url": "https://your-private-url.com/"
}
```

**URL Override:** If a `url` is set in `config.private.json`, it takes precedence over the `url` in `config.json`. This allows you to keep the real site URL private and out of version control.

### playwright.config.ts

Playwright options per app: browser projects, timeouts, retries, workers, report output paths.

## Implemented Tests

Tests run across Chromium, Firefox, and WebKit by default.

### Hyva Base Tests (`src/apps/hyva/tests/`)

#### Customer Tests (`customer.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Create account and login | Yes |

#### Search Tests (`search.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Search with multiple results | Yes |
| Search with no results | Yes |
| Show search suggestions | Yes |

#### Category Tests (`category.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Apply filters | Yes |
| Sort by price (low to high) | Yes |
| Sort by price (high to low) | Yes |
| Sort by name (a-z) | Yes |
| Sort by name (z-a) | Yes |
| Change displayed products (limiter) | Yes |
| Breadcrumb display | Yes |
| Pagination | Yes |
| Switch list/grid view | Yes |
| Compare multiple products | Yes |

#### Home Page Tests (`home.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Navigate to homepage | Yes |
| Search from homepage | Yes |

#### Cart Tests (`cart.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Change quantity in cart | Yes |
| Remove product from cart | Yes |
| Verify product prices and totals | Yes |

#### Sidecart Tests (`sidecart.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Open sidecart | Yes |
| Delete item from sidecart | Yes |
| Navigate to product via edit icon | Yes |
| Navigate to cart via link | Yes |
| Navigate to checkout via button | Yes |

#### Sidecart Price Tests (`sidecart_prices.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Verify slider prices | Yes |

#### Simple Product Tests (`simple_product.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Display title and image | Yes |
| Display price | Yes |
| Breadcrumbs | Yes |
| Increment quantity on PDP | Yes |
| Add to wishlist (logged in) | Yes |
| Cannot add to wishlist (not logged in) | Yes |
| Add to compare | Yes |

#### Configurable Product Tests (`configurable_product.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Display title and image | Yes |
| Display price | Yes |
| Breadcrumbs | Yes |
| Increment quantity on PDP | Yes |
| Cannot add to cart without configuration | Yes |
| Select product attributes | Yes |
| Add to cart and verify options in cart | Yes |
| Add to wishlist (logged in) | Yes |
| Cannot add to wishlist (not logged in) | Yes |
| Add to compare | Yes |

#### CMS Tests (`cms.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Display 404 page | Yes |
| Open default CMS page | Yes |

### Admin Tests (`src/apps/admin/tests/`)

#### Admin Checkout Tests (`checkout.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Checkout using Check / Money Order | Yes |
| Checkout using Cash on Delivery | Yes |
| Checkout using Purchase Order | Yes |

#### Admin Product Tests (`products.spec.ts`)
| Test | Implemented |
|------|:-----------:|
| Products listed in grid | Yes |
| Edit product and save | Yes |

### Checkout Tests (`src/apps/checkout/tests/`)

| Test | Implemented |
|------|:-----------:|
| Proceed to checkout from cart | Yes |
| Checkout via Braintree | Yes |
| Existing email triggers login prompt | Yes |

## Getting Started

### Prerequisites
* Linux/Mac environment (Playwright Docker containers recommended)
* Node.js and npm/yarn installed

### Installation

```bash
# From your project root
mkdir tests && cd tests
git clone git@github.com:ProxiBlue/m2-hyva-playwright.git
cd m2-hyva-playwright
npm install
yarn run playwright install --with-deps
#copy the exmample private config in place
cp src/apps/hyva/config.private.json.sample src/apps/hyva/config.private.json
```

## Running Tests

For detailed report information, see [Test Reports Documentation](./TEST_REPORTS.md).

### From the Root Folder

```bash
# Run all Hyva base tests
yarn workspace hyva test:all

# Interactive UI mode
yarn workspace hyva test:ui

# Headed browser (visible)
yarn workspace hyva test:display
```

### Running a Site App Against Base Tests

```bash
# Run base Hyva tests against PPS site
yarn workspace pps test:hyva

# Run PPS-specific tests only
yarn workspace pps test:pps

# Run all PPS test suites (hyva + pps + checkout + admin)
yarn workspace pps test:all

# Individual suites
yarn workspace pps test:pps-checkout
yarn workspace pps test:admin
```

### From the App Folder

```bash
cd src/apps/pps
yarn test:all
yarn test:hyva
yarn test:pps
```

Available scripts are defined in each app's `package.json`.

### Running with DDEV

DDEV environments may produce SSL certificate errors (`net::ERR_CERT_AUTHORITY_INVALID`). Run tests inside the container:

#### Option 1: SSH into DDEV (Recommended)
```bash
ddev ssh
cd /var/www/html/tests/m2-hyva-playwright/
APP_NAME=pps TEST_BASE=hyva npx playwright test
```

#### Option 2: DDEV Exec
```bash
ddev exec "cd tests/m2-hyva-playwright/ && APP_NAME=pps TEST_BASE=hyva npx playwright test"
```

## Adding Your Own App

### Bootstrap

```bash
./bootstrapNewApp.sh {yourappname}
```

Creates the directory structure under `src/apps/{yourappname}`:

```
{yourappname}/
  data/           # Test data JSON files
  fixtures/       # Playwright fixtures (index.ts)
  locators/       # CSS/DOM selector overrides
  pages/          # Page object classes
  tests/          # Test spec files
  interfaces/     # TypeScript interfaces
  config.json
  config.private.json
  playwright.config.ts
  package.json
```

### Extending Base Fixtures

Import and extend the base Hyva fixtures:

```typescript
import { test as hyvaBase } from "@hyva/fixtures";

// Override a page object
const test = hyvaBase.extend({
  homePage: async ({ page }, use, workerInfo) => {
    await use(new MyHomePage(page, workerInfo));
  }
});
```

Your page class can extend the base Hyva page class to reuse existing methods and override specific ones.

### Overriding Data Files

Create a JSON file with the same name in your app's `data/` directory. When `APP_NAME` is set to your app, your file is loaded instead of the base.

### Overriding Locators

Create a locator file with the same name in your app's `locators/` directory. Only export the locators that differ from the base. The framework merges your overrides with the base locators:

```typescript
// src/apps/myapp/locators/cart.locator.ts
// Only override what differs from the base Hyva cart locators
export const cart_table = 'table#shopping-cart-table';
export const cart_table_body = 'tbody';
```

### Skipping Base Tests

Define tests to skip in your app's `config.json`:

```json
{
  "skipBaseTests": {
    "Category test suite": [
      "Filters",
      "it can sort the products by name (a-z)"
    ],
    "Configurable products test suite": [
      "Can increment the product quantity on the pdp"
    ]
  }
}
```

Keys are the `describe()` block titles. Values are arrays of `test()` titles to skip.

Tests must call `shouldSkipTest()` in their `beforeEach`:

```typescript
import { shouldSkipTest } from "@utils/functions/test-skip";

test.beforeEach(async ({ homePage }, testInfo) => {
    const shouldSkip = shouldSkipTest(testInfo);
    test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
    await homePage.navigateTo();
});
```

For details, see [TEST_SKIP_SOLUTION.md](./TEST_SKIP_SOLUTION.md).

### Checkout Tests

The included `src/apps/checkout/` app covers Luma checkout with Braintree. Replace its contents with tests matching your site's checkout implementation (Hyva checkout, React checkout, etc.). Import fixtures and pages from other apps as needed:

```typescript
import { SimpleProductPage } from "@hyva/pages/simple_product.page";
```

An example Luma checkout app: [Checkout Tests Example](https://github.com/ProxiBlue/m2-checkout-tests-example)

## Locale

Faker.js is used for generated test data. Set your locale in `config.json`:

```json
{ "faker_locale": "en_US" }
```

Country selection is not limited by locale — handle country selections in your tests.

## Logging and Test Output

All test logs, reports, and outputs go to `tests/m2-hyva-playwright/test-results/`. Each app uses its own subfolder (e.g., `test-results/pps/`, `test-results/admin/`).

Do not write test outputs to any other location.

