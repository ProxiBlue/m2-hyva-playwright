# Magento 2 Hyva playwright tests

## Introduction

The goal of this project is to create an extensible Playwright testing environment for Magento 2 + Hyva projects.
The main focus of this project was to: 

* Have a base set of Hyva tests, which can be extended/updated by community members without affecting your own site-specific tests
* Have a set of sub-tests (site tests) on a private repo that you can layer 'on top' of the base Hyva tests

This approach makes it easier to update the base tests without dealing with merge conflicts each time you update the base Hyva tests, 
as you won't need to modify those tests directly (unless you're contributing updates or new tests).

## Built as I went along / Learning

Please note that this project was built as I learnt playwright and other aspects. 
Some things may likely be improved upon, and be changed, so feel free to join in and help improve.
I figured I can put the idea forward even though not many tests exists as yet. It is a WIP.

I am certainly not an expert in anything playwright or js related!

## Admin & checkout split out as seperated apps

* There is now an 'admin' app which you can pull in pages/fixtures of in your tests to effect admin related tests, or just use as is to test base admin functionalities
* If you name your checkout app 'checkout' you can refer to its files and sources using ```@checkout```

### Admin Authentication

Admin authentication is now handled automatically with an on-demand approach:

1. When a test calls `adminPage.login()`, a temporary admin user is created specifically for that test
2. Each admin user has a unique username and a strong, randomly generated password
3. The temporary admin user is automatically removed after the test completes
4. No configuration is required for admin credentials

The admin path is still configurable in your environment or config files:

```
{
  "admin_path": "admin"
}
```

This approach allows admin tests to run in parallel with multiple workers, as each test creates its own isolated admin user.

For more details, see the [Admin Authentication Solution](./ADMIN_AUTH_SOLUTION.md) document.

## Locale for address data

The tests use faker.js, and you can set your locale in the config.json file : ```"faker_locale": "en_AU"```

Note that country selection is excluded from the built-in customer generated data as faker.js will not limit country to the selected locale.
You have to do country selections yourself.

## Progress 

Adapted from https://github.com/elgentos/magento2-cypress-testing-suite/

### Account Tests

#### Account Creation
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can create an account to log in with                                              | :heavy_check_mark:   |

#### Account Activities
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it creates an account to log in with and use for further testing                     | :heavy_check_mark:   |
| it can log out                                                                       | :heavy_check_mark:   |
| it can show the account information page and display the name of the customer        | :black_square_button: |
| it can change the password                                                           | :black_square_button: |
| it can change the name of the customer on the account information page               | :black_square_button: |
| it can navigate to all customer account pages and displays the correct titles        | :black_square_button: |
| it can navigate to order history and displays that there are no placed orders        | :black_square_button: |
| it can add a new address                                                             | :black_square_button: |
| it can change an existing address                                                    | :black_square_button: |
| it can remove an address                                                             | :black_square_button: |
| it subscribe through the newsletter subscription page                                | :black_square_button: |
| it can add an address automatically when an order is placed                          | :black_square_button: |
| it can add a product to the wishlist of the logged in customer on a productpage      | :heavy_check_mark:   |
| it can edit the wishlist on the wishlist page                                        | :black_square_button: |
| it can reset the password when it is forgotten                                       | :black_square_button: |

#### Login Tests (Do not login before these tests)
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can login from cart without making changes to the cart                            | :black_square_button: |
| it can login from checkout                                                           | :black_square_button: |

### Search Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can perform search with multiple hits                                             | :heavy_check_mark:   |
| it can find a single product                                                         | :black_square_button: |
| it can show a page for no search results when the searchterm cannot give any results | :heavy_check_mark:   |
| it can show suggestions when entering search terms                                   | :heavy_check_mark:   |

### Category Page Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can navigate to the category page and apply filters                               | :heavy_check_mark:   |
| it can sort the products on price from lowest to highest                             | :heavy_check_mark:   |
| it can sort the products on price from highest to lowest                             | :heavy_check_mark:   |
| it can sort the products by name (a-z)                                               | :heavy_check_mark:   |
| it can sort the products by name (z-a)                                               | :heavy_check_mark:   |
| it can change the number of products to be displayed                                 | :heavy_check_mark:   |
| it checks if the breadcrumb is displayed correctly                                   | :heavy_check_mark:   |
| it checks if the pagination is working                                               | :heavy_check_mark:   |
| it can change the number of displayed products (limiter)                             | :heavy_check_mark:   |
| it can switch from list to grid view                                                 | :heavy_check_mark:   |
| it can add multiple products to compare, and compare count indicators work           | :heavy_check_mark:   |
| it can add a simple product directly to the cart                                     | :heavy_check_mark:   |
| it can add a configurable product with swatches directly to the cart                 | :black_square_button: |
| it can add a complex product to the cart                                             | :black_square_button: |

### Home Page Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can navigate to the homepage                                                      | :heavy_check_mark:   |
| it can perform search from homepage                                                  | :heavy_check_mark:   |
| it can open a category                                                               | :black_square_button: |
| it can show the header correctly and all links work                                  | :black_square_button: |
| it can show the footer correctly and all links work                                  | :black_square_button: |
| it can show the main section of the homepage correctly and all links work            | :black_square_button: |
| it can subscribe to the newsletter                                                   | :black_square_button: |
| it can add products shown on the homepage to the cart                                | :black_square_button: |
| it shows the cookie banner when cookies are not accepted yet                         | :black_square_button: |

### Cart Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can add a product to the cart                                                     | :heavy_check_mark:   |
| it can change the quantity in the cart                                               | :heavy_check_mark:   |
| it can remove a product from the cart                                                | :heavy_check_mark:   |
| it displays the correct product prices and totals                                    | :heavy_check_mark:   |
| it can add a coupon to the cart                                                      | :black_square_button: |
| it can delete an added coupon from the cart                                          | :black_square_button: |
| it cannot add a non existing coupon                                                  | :black_square_button: |
| it merges an already existing cart when a customer logs in                           | :black_square_button: |

### Minicart Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can open the cart slider by clicking on the cart icon in the header               | :heavy_check_mark:   |
| it checks if the prices in the slider are displayed correctly                        | :heavy_check_mark:   |
| it checks if the items in the slider are displayed correctly                         | :black_square_button: |
| it can delete an item in the cart slider                                             | :heavy_check_mark:   |
| it can change the quantity of an item in the cart slider                             | :black_square_button: |
| it can navigate to the cart with a link in the slider                                | :black_square_button: |
| it can navigate to the checkout with a link in the slider                            | :black_square_button: |

### Product Page Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can display the title and image of the product                                    | :heavy_check_mark:   |
| it shows the product price                                                           | :heavy_check_mark:   |
| it shows the correct breadcrumb                                                      | :heavy_check_mark:   |
| it can increment the product quantity on the pdp                                     | :heavy_check_mark:   |
| it can configure the product when it is a configurable product                       | :heavy_check_mark:   |
| it can add the product to the cart                                                   | :heavy_check_mark:   |
| it can't add the product to the cart if it is a configurable product and no options are selected | :heavy_check_mark: |
| it can add the product to the wishlist when logged in                                | :heavy_check_mark:   |
| it can't add a product to a wishlist when the user is not logged in                  | :heavy_check_mark:   |
| it can show reviews made by logged in customers                                      | :black_square_button: |
| it can add a review when logged in                                                   | :black_square_button: |
| it can indicate if a product is in stock                                             | :black_square_button: |
| it can't add a product to the cart when the product is out of stock                  | :black_square_button: |

### Bundle Products Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can render the product name                                                       | :black_square_button: |
| it can set the price to zero when every associated product qty is zero               | :black_square_button: |
| it can calculate the price based on selected options                                 | :black_square_button: |
| it can display selection quantities                                                  | :black_square_button: |
| it can add a bundled product to the cart                                             | :black_square_button: |

### CMS Page Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it shows the default 404 page on a non-existent route                                | :heavy_check_mark:   |
| it can open the default CMS page correctly                                           | :heavy_check_mark:   |

### Contact Form Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it shows the contact form correctly                                                  | :black_square_button: |
| it cannot submit a form when no valid email address is entered                       | :black_square_button: |
| it can submit the form when all validation passes                                    | :black_square_button: |

### Back-end Tests
| Test                                                                                 | Status                |
|--------------------------------------------------------------------------------------|----------------------|
| it can login on the administration panel of the magento environment                  | :heavy_check_mark:   |
| it can show customer data                                                            | :black_square_button: |
| it can perform checkout using Check / Money Order                                    | :heavy_check_mark:   |
| it can perform checkout using Cash on Delivery                                       | :heavy_check_mark:   |
| it can perform checkout using Purchase Order                                         | :heavy_check_mark:   |
| it can edit an order                                                                 | :black_square_button: |


Out the box we will tests: Chromium, webkit and firefox. Ref in playwright config file, you can add your own in your layered app.

## Getting Started

### Prerequisites
* A Linux/Mac environment (not tested on Windows)
  * Using Playwright Docker containers is recommended as they include all necessary packages
* Node.js and npm installed

### Installation Steps
1. Create a folder called 'tests' (case sensitive) in your project root:
   ```bash
   mkdir tests
   cd tests
   ```

2. Clone this repository:
   ```bash
   git clone git@github.com:ProxiBlue/m2-hyva-playwright.git
   cd m2-hyva-playwright
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Install Playwright and browser dependencies:
   ```bash
   yarn run playwright install --with-deps
   ```
## Running Tests

After installation, you can run the base Hyva tests against the Hyva example website.

For detailed information about test reports, including how to find and interpret screenshots and videos of failed tests, see [Test Reports Documentation](./TEST_REPORTS.md).

### Configuration
Before running tests, check the configuration file to see the target site URL:
```
https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/config.json
```

You'll need to edit this file later when setting up your own app.

### Running Tests from the Root Folder
You can run tests from the project root directory using these commands:

```bash
# Run all tests
yarn workspace hyva test

# Run tests with interactive UI
yarn workspace hyva test:ui

# Run tests with display (useful for visual debugging)
yarn workspace hyva test:display
```

### Running Tests with DDEV
When running tests against a DDEV environment, you may encounter SSL certificate validation errors (`net::ERR_CERT_AUTHORITY_INVALID`). There are two approaches to resolve this:

#### Option 1: SSH into the DDEV Web Container (Recommended)
This approach runs the tests directly inside the DDEV web container:

```bash
# First, SSH into the DDEV web container
ddev ssh

# Then navigate to the tests directory and run the tests
cd /var/www/html/tests/m2-hyva-playwright/
APP_NAME=hyva  TEST_BASE=hyva npx playwright test
```

This method is preferred as it runs the tests in the same environment where your application is running, ensuring consistent behavior.

#### Option 2: Using DDEV Exec
Alternatively, you can run the tests using ddev exec from your host machine:

```bash
# Run tests using DDEV to handle SSL certificates
ddev exec "cd tests/m2-hyva-playwright/ && APP_NAME=hyva  TEST_BASE=hyva npx playwright test"
```

Both approaches run the tests inside the DDEV container, which properly handles the SSL certificates for the DDEV site.

### Running Tests from the App Folder
Alternatively, you can run tests from the app directory:

```bash
# Navigate to the app directory
cd src/apps/hyva

# Run tests (choose one of these commands)
yarn test
yarn test:ui
yarn test:display

# Run with Playwright debugger
yarn test:debug
```

All available commands are defined in the `package.json` scripts section for each app:
[Example package.json](https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/package.json)

For a video demonstration of running tests, see: [Playwright Testing Demo](https://youtu.be/R6wQaD1cP2Q)

## Adding Your Own Tests for Your App

Running tests against the Hyva demo store is useful for learning, but you'll want to test your own Magento store. This section explains how to set up your own app for testing.

### Architecture Overview

The framework is designed to have your apps as sub-git projects under the `src/app` folder. This approach:

* Allows you to maintain your own tests separately
* Prevents your tests from being overwritten when updating the base Hyva tests
* Lets you extend or override base Hyva tests as needed for your site
* Enables you to skip base tests that aren't relevant to your implementation

### Creating Your App

There's a convenient bootstrap script that will set up your app structure:

```bash
# Run from the root folder
./bootstrapNewApp.sh {yourappname}
```

**Note**: Don't use spaces in your app name.

This script will:
1. Create the necessary folder structure under `src/apps/{yourappname}`
2. Add required configuration files
3. Initialize a blank git repository for your app

You'll need to add your own remote repository to push your tests to (assuming you're familiar with Git).

### Key Configuration Files

After creating your app, you'll need to edit these files in the `src/apps/{yourappname}` folder:

1. **config.json**
   * Define your site URLs and other configuration settings
   * Example: See the PPS app configuration mentioned below

2. **config.private.json** (optional)
   * Store sensitive data like API keys or other private configuration
   * **Important**: Add this file to `.gitignore` to prevent committing sensitive information

3. **playwright.config.js**
   * Configure Playwright options for your app
   * Add additional browser/device configurations to test on

### Example App Implementation

An example app implementation is available at: [PPS Example Tests](https://github.com/ProxiBlue/pps-example-tests)

#### Cloning and Running the Example

Follow these steps to clone and run the example tests:

```bash
# Navigate to the apps directory
cd src/apps

# Clone the example repository
git clone git@github.com:ProxiBlue/pps-example-tests.git pps

# Return to the main project folder
cd ../../../
```

Now you can run the tests made for the Hyva base theme against your site (app).

#### Running the Example Tests

From the project root folder:

```bash
# Run the tests for the PPS app against the PPS site
yarn workspace pps test:all
```

or you can run individual test suites

```bash
yarn workspace pps test:hyva
yarn workspace pps test:pps
yarn workspace pps test:pps-checkout
yarn workspace pps test:admin
```

obviously, since you cannot test the example site live, admin/checkout tests will fail.

You'll notice that:
1. The base Hyva tests run first
2. Then the PPS (app) tests run
3. The tests use the playwright config and data files from the PPS app

This is achieved by the command:
```bash
APP_NAME=pps TEST_BASE=hyva npx playwright test
```

Where:
- `APP_NAME=pps` designates which app to use as the base for running tests
- `TEST_BASE=hyva` designates where to run tests from

Alternatively, you can run tests from the app folder:

```bash
# Navigate to the app directory
cd src/apps/pps

# Run the tests
npx yarn test:all
```

#### Skipping Base Tests

##### Problem

When running layered tests where one app extends another (e.g., a site-specific app extending the base Hyva tests), there's a need to skip certain base tests that aren't relevant to the extending app. The original implementation had a flaw where tests with identical names in different test suites would both be skipped when only one was intended to be skipped.

For example, if both `simple_product.spec.ts` and `configurable_product.spec.ts` had tests with identical names, and only the tests in `configurable_product.spec.ts` needed to be skipped, the original implementation would skip those tests in both files.

##### Solution

The solution provides a more robust way to skip tests by considering both the test suite name and the test title, rather than just the test title.

You can skip specific base tests by defining them in your app's `config.json` file under the `skipBaseTests` key.

The configuration organizes tests to skip by test suite name, providing better organization and preventing conflicts when test titles are the same across different test suites:

```json
{
  "skipBaseTests": {
    "Category test suite": [
      "Filters",
      "it can sort the products by name (a-z)"
    ],
    "Configurable products test suite": [
      "Can increment the product quantity on the pdp",
      "Can add configurable product to cart and verify options in cart"
    ],
    "Simple Product test suite": [
      "Can add a product to a wishlist when the user is logged in"
    ]
  }
}
```

##### Implementation in Test Files

For this to work, tests should use the `shouldSkipTest` helper function:

```javascript
import { shouldSkipTest } from "@utils/functions/test-skip";

test.beforeEach(async ({ homePage }, testInfo) => {
    // Use the helper function to determine if the test should be skipped
    // The function automatically extracts the test suite name from testInfo.parent.title
    const shouldSkip = shouldSkipTest(testInfo);

    test.skip(shouldSkip, testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
    await homePage.navigateTo();
});
```

The `shouldSkipTest` function extracts the test suite name from `testInfo.parent.title` and the test title from `testInfo.title`, eliminating the need for manual test suite name declaration.

##### Benefits

1. **Precision**: Skip tests based on both test suite and test title, preventing unintended skips
2. **Maintainability**: Clearer configuration structure makes it easier to manage which tests to skip
3. **Simplicity**: Automatic extraction of test suite name eliminates the need for manual declaration

##### Troubleshooting

If tests aren't being skipped as expected:

1. Verify the test suite name in your config matches the describe block's title exactly
2. Check that the test title in your config matches the test's title exactly
3. Ensure the `shouldSkipTest` function is being called correctly in the beforeEach hook
4. For debugging, you can add console logs in the test-skip.ts file to see what's being checked

For a detailed explanation of the test skip solution, see [TEST_SKIP_SOLUTION.md](./TEST_SKIP_SOLUTION.md).

![2023-11-11_19-41](https://github.com/ProxiBlue/m2-hyva-playwright/assets/4994260/e396b920-332e-40af-9d97-b47795938210)


## Important Implementation Details

### App Fixtures File

The fixtures file is a key part for extending the base Hyva tests. See the example here:
[PPS Example Fixtures](https://github.com/ProxiBlue/pps-example-tests/blob/main/fixtures/index.ts)

#### Extending Base Fixtures

You can extend the base Hyva fixtures file to:
- Add your own fixtures
- Override base fixtures with your custom implementations

Import the base fixtures:
```javascript
import { test as hyvaBase } from "@hyva/fixtures";
```

**Note**: You can always use `@hyva` to import from the base Hyva app folder.

#### Example: Overriding a Page Object

1. Import your custom page class:
   ```javascript
   import PPSHomePage from "../pages/home.page";
   ```

2. Override the base fixture:
   ```javascript
   {
     homePage: async ({ page }, use, workerInfo) => {
         await use(new PPSHomePage(page, workerInfo));
     }
   }
   ```

Your `PPSHomePage` class can extend the base Hyva `HomePage` class, allowing you to:
- Reuse base Hyva functions
- Override specific functions with your custom implementations

#### Data File Overrides

You can customize test data in two ways:

1. **Import base data files**: Import Hyva base locators/data JSON files and extend them

2. **Create matching data files**: Create a data file in your app with the same name as one in the base Hyva tests. Your app's data file will be loaded instead of the Hyva base one.

This approach lets you use your site-specific data with base Hyva tests without modifying the base files, making it easier to update from upstream.

#### How Data File Overrides Work

The framework uses dynamic imports in the base Hyva classes:

```javascript
// Dynamically import test JSON data based on APP_NAME env variable
// If file exists in APP path, use it; otherwise default to base data
let data = {};
const fs = require("fs");
if (fs.existsSync(__dirname + '/../../' + process.env.APP_NAME + '/data/cart.data.json')) {
    import('../../' + process.env.APP_NAME + '/data/cart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
} else {
    import('../data/cart.data.json').then((dynamicData) => {
        data = dynamicData;
    });
}
```

You won't need this in your app classes unless you plan to have a base app that's extended by other apps.


### Page Object Model Approach

This framework follows the Page Object Model (POM) pattern, which offers several benefits:

1. **Better organization**: Keep test logic separate from page interactions
2. **Reusability**: Reuse page objects across multiple tests
3. **Maintainability**: When the UI changes, you only need to update the page object, not all tests
4. **Extensibility**: Extend page objects for your specific site needs

It's recommended to:
- Keep page interactions in 'page' classes
- Call these methods from your test files

For your app, this approach is especially valuable if you plan to have multiple apps extending your base app.

### Native Playwright Approach

This project uses native Playwright syntax:

- Native Playwright methods are used throughout the tests
- This approach provides better learning opportunities and more direct control
- Direct use of Playwright's API ensures compatibility with future updates

For more information:
- [Video tutorial on working with the framework](https://youtu.be/mz2zec4I18Q)
- [Example test run recording](https://asciinema.org/a/KWSqlCqKqU4XXDP25K0f17WWT)

### Checkout Tests

Since Hyvä is checkout-independent (sites may use Luma, React, Hyvä checkout, etc.), it's recommended to keep checkout tests as a separate app.

An example app using Luma checkout is available here: [Checkout Tests Example](https://github.com/ProxiBlue/m2-checkout-tests-example)

#### Setting Up Checkout Tests

When creating checkout tests:

1. Edit the default bootstrap-generated `package.json` file:
   - Remove the run of the base Hyvä theme
   - Keep only the part after the bash `&&` to run just the checkout tests

2. Import fixtures and pages from other test apps:
   ```javascript
   // Example: Importing simple products page
   // https://github.com/ProxiBlue/m2-checkout-tests-example/blob/main/fixtures/index.ts#L20
   import { SimpleProductPage } from "@hyva/pages/simple_product.page";
   ```

3. Reuse existing functionality in your tests:
   ```javascript
   // Example: Adding item to cart before checkout
   // https://github.com/ProxiBlue/m2-checkout-tests-example/blob/main/tests/checkout.spec.ts#L8
   await simpleProductPage.addToCart();
   ```

#### Using Test Data

The framework includes a customer data object that uses Faker.js to generate test data for forms:

- [Example fixture setup](https://github.com/ProxiBlue/m2-checkout-tests-example/blob/main/fixtures/index.ts#L26)
- [Example usage in checkout page](https://github.com/ProxiBlue/m2-checkout-tests-example/blob/main/pages/checkout.page.ts#L43)

## Example Test Run Output

Below is an example of running the tests against the Hyva demo site. This shows how tests run in parallel across multiple browsers (Chromium, Firefox, and WebKit).

```bash
$ APP_NAME=hyva  playwright test

Running 48 tests using 5 workers

  ✓  1 [chromium] › home.spec.ts:10:9 › Home › it can navigate to the homepage (4.4s)
  ✓  2 [chromium] › cart.spec.ts:11:9 › Cart actions with one Item in cart › it can change the quantity in the cart  (12.4s)
  ✓  3 [chromium] › category.spec.ts:10:9 › Category Product List actions › Filters (18.4s)
  ✓  4 [firefox] › cart.spec.ts:11:9 › Cart actions with one Item in cart › it can change the quantity in the cart  (10.6s)

  # Additional test results omitted for brevity

  ✓  48 [webkit] › category.spec.ts:46:9 › Category Product List actions › it can add multiple products to compare, and compare count indicators work. (12.6s)

  Slow test file: [webkit] › category.spec.ts (1.2m)
  Slow test file: [firefox] › category.spec.ts (1.1m)
  Slow test file: [chromium] › category.spec.ts (1.1m)
  Slow test file: [webkit] › cart.spec.ts (37.6s)
  Slow test file: [chromium] › cart.spec.ts (30.0s)
  Consider splitting slow test files to speed up parallel execution
  48 passed (1.8m)

To open last HTML report run:

  yarn playwright show-report reports/playwright-report

Done in 106.68s.
```

### Key Observations from the Output

1. **Parallel Execution**: Tests run simultaneously across multiple browsers (Chromium, Firefox, WebKit)
2. **Test Duration**: Each test shows its execution time, helping identify slow tests
3. **Performance Insights**: Playwright provides suggestions for improving test performance
4. **HTML Reports**: A detailed HTML report is generated for each test run

To view the HTML report after a test run, use:

```bash
yarn playwright show-report reports/playwright-report
```

This report provides detailed information about each test, including screenshots, traces, and logs, which can be invaluable for debugging failed tests.

## Acknowledgements

This project has been developed specifically for Magento 2 + Hyvä testing needs, focusing on providing a robust and maintainable testing framework for Hyvä-based storefronts.
