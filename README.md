# Magento 2 Hyva playwright tests

## Instroduction

The goal of this project is to create an extensible Playwright testing environment for Magento 2 + Hyva projects.
The main focus of this project was to: 

* have a base set of Hyva tests, which can be extended / updated by community members without affecting your own site specific tests
* Have a set of sub-tests (site tests) on a private repo that you can layer 'ontop' of the base hyva tests.

This process will ease the pain of updating the base tests and not have merge conflict hell each time you update the base Hyva tests 
as you will have no need to adjust those tests in any way. (unless the point is to contribute updates/new tests)

## Built as I went along / Learning

Please note that this project was built as I learnt playwright and other aspects. 
Some things may likely be improved upon, and be changed, so feel free to join in and help improve.
I figured I can put the idea forward even though not many tests exists as yet. It is a WIP.

I am certainly not an expert in anything playwright or js related!

## Progress 

Stolen from https://github.com/elgentos/magento2-cypress-testing-suite/


| Spec file               | Group                           | Test                                                                                                                                                 |
|-------------------------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
|                         | Account test creation           | :heavy_check_mark: it can create an account to log in with                                                                                        |
|                         | Account activities              | :black_square_button: it creates an account to log in with and use for further testing                                                               |
|                         |                                 | :heavy_check_mark: it can log out                                                                                                                 |
|                         |                                 | :black_square_button: it can show the account information page and display the name of the customer                                                  |
|                         |                                 | :black_square_button: it can change the password                                                                                                     |
|                         |                                 | :black_square_button: it can change the name of the customer on the account information page                                                         |
|                         |                                 | :black_square_button: it can navigate to all customer account pages and displays the correct titles                                                  |
|                         |                                 | :black_square_button: it can navigate to order history and displays that there are no placed orders                                                  |
|                         |                                 | :black_square_button: it can add a new address                                                                                                       |
|                         |                                 | :black_square_button: it can change an existing address                                                                                              |
|                         |                                 | :black_square_button: it can remove an address                                                                                                       |
|                         |                                 | :black_square_button: it subscribe through the newsletter subscription page                                                                          |
|                         |                                 | :black_square_button: it can add an address automatically when an order is placed                                                                    |
|                         |                                 | :black_square_button: it can add a product to the wishlist of the logged in customer on a productpage and store it                                   |
|                         |                                 | :black_square_button: it can edit the wishlist on the wishlist page                                                                                  |
|                         |                                 | :black_square_button: it can reset the password when it is forgotten                                                                                 |
|                         | Do not login before these tests | :black_square_button: it can login from cart without making changes to the cart                                                                      |
|                         |                                 | :black_square_button: it can login from checkout                                                                                                     |
|                         | Perform searches                | :black_square_button: it can perform search with multiple hits                                                                                       |
|                         |                                 | :black_square_button: it can find a single product                                                                                                   |
|                         |                                 | :black_square_button: it can show a page for no search results when the searchterm cannot give any results                                           |
|                         |                                 | :black_square_button: it can show suggestions when entering search terms                                                                             |
| category.spec.ts        | Category page tests             | :heavy_check_mark: it can navigate to the category page and apply filters as defined in categoiry.data,json                                          
|                         |                                 | :heavy_check_mark: it can sort the products on price from lowest to highest                                                                          |
|                         |                                 | :heavy_check_mark: it can sort the products on price from highest to lowest                                                                          |
|                         |                                 | :heavy_check_mark: it can sort the products by name (a-z)                                                                                            |
|                         |                                 | :heavy_check_mark: it can sort the products by name (z-a)                                                                                            |
|                         |                                 | :black_square_button: it can change the number of products to be displayed                                                                           |
|                         |                                 | :heavy_check_mark: it checks if the breadcrumb is displayed correctly                                                                                |
|                         |                                 | :heavy_check_mark: it checks if the pagination is working                                                                                            |
|                         |                                 | :heavy_check_mark: it can change the number of displayed products (limiter)                                                                          |
|                         |                                 | :heavy_check_mark: it can switch from list to grid view                                                                                              |
|                         |                                 | :heavy_check_mark: it can add multiple products to compare, and compare count indicators work.                                                       |
|                         |                                 | :black_square_button: it can add a simple product directly to the cart.                                                                              |
|                         |                                 | :black_square_button: it can add a configurable product with swatches directly to the cart.                                                          |
|                         |                                 | :black_square_button: it can add a complex product to the cart. ref: https://demo.hyva.io/set-of-sprite-yoga-straps.html                             |
| home.pec.ts             | Home page tests                 | :heavy_check_mark: it can navigate to the homepage                                                                                                   |
|                         |                                 | :heavy_check_mark: it can perform search from homepage                                                                                               |
|                         |                                 | :black_square_button: it can open a category                                                                                                         |
|                         |                                 | :black_square_button: it can show the header correctly and all links work                                                                            |
|                         |                                 | :black_square_button: it can show the footer correctly and all links work                                                                            |
|                         |                                 | :black_square_button: it can show the main section of the homepage correctly and all links work                                                      |
|                         |                                 | :black_square_button: it can subscribe to the newsletter                                                                                             |
|                         |                                 | :black_square_button: it can add products shown on the homepage to the cart when an add to cart button is present                                    |
|                         |                                 | :black_square_button: it shows the cookie banner when cookies are not accepted yet (Vanilla Hyvä shows no cookie banner)                             |
|                         | Cart tests                      | :black_square_button: it can add a product to the cart                                                                                               |
|                         |                                 | :heavy_check_mark: it can change the quantity in the cart                                                                                            |
|                         |                                 | :heavy_check_mark: it can remove a product from the cart                                                                                             |
|                         |                                 | :black_square_button: it can add a coupon to the cart                                                                                                |
|                         |                                 | :black_square_button: it can delete an added coupon from the cart                                                                                    |
|                         |                                 | :black_square_button: it cannot add a non existing coupon                                                                                            |
|                         |                                 | :black_square_button: it displays the correct product prices and totals                                                                              |
|                         |                                 | :black_square_button: it merges an already existing cart when a customer logs in                                                                     |
|                         | Minicart tests                  | :black_square_button: it can open the cart slider by clicking on the cart icon in the header                                                         |
| sidecart_prices.spec.ts |                                 | :heavy_check_mark: it checks if the prices in the slider are displayed correctly                                                                     |
|                         |                                 | :black_square_button: it checks if the items in the slider are displayed correctly                                                                   |
|                         |                                 | :black_square_button: it can delete an item in the cart slider                                                                                       |
|                         |                                 | :black_square_button: it can change the quantity of an item in the cart slider                                                                       |
|                         |                                 | :black_square_button: it can navigate to the cart with a link in the slider                                                                          |
|                         |                                 | :black_square_button: it can navigate to the checkout with a link in the slider                                                                      |
|                         | Product page tests              | :black_square_button: it can display the title and image of the product                                                                              |
|                         |                                 | :black_square_button: it shows the product price                                                                                                     |
|                         |                                 | :black_square_button: it can configure the product when it is an configurable product                                                                |
|                         |                                 | :black_square_button: it can add the product to the cart                                                                                             |
|                         |                                 | :black_square_button: it can't add the product to the cart if it is a configurable product and no options are selected                               |
|                         |                                 | :black_square_button: it can add the product to the wishlist                                                                                         |
|                         |                                 | :black_square_button: it shows the correct breadcrumb                                                                                                |
|                         |                                 | :black_square_button: it can show reviews made by logged in customers                                                                                |
|                         |                                 | :black_square_button: it can add a review when logged in                                                                                             |
|                         |                                 | :black_square_button: it can indicate if a product is in stock                                                                                       |
|                         |                                 | :black_square_button: it can't add a product to the cart when the product is out of stock (commented out, needs admin token in the cypress.env.json) |
|                         | Bundle products test            | :black_square_button: it can render the product name                                                                                                 |
|                         |                                 | :black_square_button: it can set the price to zero when every associated product qty is zero                                                         |
|                         |                                 | :black_square_button: it can calculate the price based on selected options                                                                           |
|                         |                                 | :black_square_button: it can display selection quantities                                                                                            |
|                         |                                 | :black_square_button: it can add a bundled product to the cart                                                                                       |
|                         | CMS page tests                  | :black_square_button: it shows the default 404 page on an non-existent route                                                                         |
|                         |                                 | :black_square_button: it can open the default CMS page correctly                                                                                     |
|                         | Contact form tests              | :black_square_button: it shows the contact form correctly                                                                                            |
|                         |                                 | :black_square_button: it cannot submit a form when no valid email address is entered                                                                 |
|                         |                                 | :black_square_button: it can submit the form when all validation passes                                                                              |
|                         | Back-end tests                  | :black_square_button: it can login on the administration panel of the magento environment                                                            |
|                         |                                 | :black_square_button: it can show customer data                                                                                                      |
|                         |                                 | :black_square_button: it processes orders and invoices correctly                                                                                     |
|                         |                                 | :black_square_button: it can edit an order                                                                                                           |


Out the box we will tests: Chromium, webkit and firefox. Ref in playwright config file, you can add your own in your layered app.

## Getting started

* Get a Linux/Mac box to work on. (no tested/used on windows) (using playwright dockers makes it easier, as all needed packages are installed)
* Create a folder called 'tests' (case MaTTeRs) and cd into it.
* Clone this repo and cd into it. ```git clone git@github.com:ProxiBlue/m2-hyva-playwright.git```
* You need to end up in a folder ```tests/m2-hyva-playwright```
* Run `npm install` to install dependencies
* Run `yarn run playwright install --with-deps` to install playwright and browser dependencies
* create a folder for allure test results: ```mkdir -p ./src/apps/hyva/reports/allure/allure-result```
## Running tests

At this point, you will be ready to run the base Hyva tests, against the Hyva example website.
Check the config file https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/config.json where you can
see the site urls defined. In this cas, they are all the same. (you will make edits to this later when you setup your own app)

You can run tests against multiple hosts (live/uat/dev)
You can run: `yarn workspace hyva test-{environment}` in the root folder to run the tests. eg `yarn workspace hyva test-dev`

OR you can run it from the app base folder

* run `cd src/apps/hyva`
* run `yarn test-{environment}` where site corresponds to the site defined in the config file. eg `yarn test-dev`

You will see the actual command run is: `APP_NAME=hyva NODE_ENV=dev playwright test`, so you can run it in the UI as well.
`APP_NAME=hyva NODE_ENV=dev npx playwright test --ui`
OR remove headless
`APP_NAME=hyva NODE_ENV=dev npx playwright test --headed`
OR use ```yarn test:ui``` to run with UI (from within app folder,
OR use ```yarn test:debug``` to start with the playwright debugger.

you can see the commands are in the package.json scripts section for each app. Example: https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/package.json

ref: ref: https://youtu.be/R6wQaD1cP2Q

## Adding your own tests for your app

Ok, so great, but not very helpful to run tests against the Hyva demo store. So let's add your own app.

The idea behind this setup is to have your apps as sub-git projects under the src/app folder.

This allows you to have your own tests, and not have to worry about them being overwritten when you update the base Hyva tests.

The test in your apps will extend the tests in the Hyva base, for those that need to be tweaked, or just run the base Hyva ones, but against your site.

You can also set base Hyva tests to be skipped, for anything you don't want, or had completely replaced (more on that below)

There is a bash script that will bootsrap your app structure under src/apps/{yourappname} and add the needed files.
You can run it from the root folder with `./bootstrapNewApp.sh {yourappname}` (no spaces in app name)
This will initialise a blank git repo allowing you to add and commit your tests to your own (private) repo.
You will need to add in your own remote to push commits to. (I am assuming you know how to do all that using GIT)

Files of interest that you must edit: (all files are in the src/apps/{yourappname} folder)

* config.json - this is where you define your site urls, and any other config you need. (see the example in the pps app noted below)
* playwright.config.js - this is where you can set the playwright oiptions for your app. For example, adding in more projects (browsers / devices) to test on.

I have an example here: https://github.com/ProxiBlue/pps-example-tests

Let's clone that into place, and run the example tests.

* run `cd src/apps`
* run `git clone git@github.com:ProxiBlue/pps-example-tests.git pps`
* run `cd ../../../` (which brings you back to the main top level folder of the repo)

Now you can run the tests made for the Hyva base theme, against your site (app) theme.

You will see in the run, the base Hyva tests will run first, then after that the PPS (app) tests will run.

You can skip tests by defining them in the config.json file, under the `skipBaseTests` key. (Still wanting for a better way, if any ideas :) )
ref: https://github.com/ProxiBlue/pps-example-tests/blob/main/config.json#L7C4-L7C17

For this purpose, any tests added to the base Hyva tests MUST have a skip tests line, to allow that test to be skipped by any defined apps
```test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);```

This can be defined in a beforeEach function, or in the test itself. (I am still learning playwright, so maybe there is a better way to implement this idea!)

```
    test.beforeEach(async ({ homePage}, testInfo) => {
        test.skip(process.env.skipBaseTests.includes(testInfo.title), testInfo.title + " test skipped for this environment: " + process.env.APP_NAME);
        await homePage.navigateTo();
    });
```

So, from the top level folder, run `npx yarn workspace pps test-live` to run the tests for the pps app, against the PPS site.
You will see here that although we are running the base Hyva tests, under the hyva app folder, the tests are using the playwright config and data files from the PPS app.
This is achieved by the adjusted command: `APP_NAME=pps NODE_ENV=live TEST_BASE=hyva playwright test` where the APP_NAME is designating which app to use as base to run the tests, but TEST_BASE designates where to run tests from.

You can also run the tests from the app folder, as noted above.

* run `cd src/apps/pps`
* run `npx yarn test-live`

![2023-11-11_19-41](https://github.com/ProxiBlue/m2-hyva-playwright/assets/4994260/e396b920-332e-40af-9d97-b47795938210)
  

## Things of interest

### App fixtures file

https://github.com/ProxiBlue/pps-example-tests/blob/main/fixtures/index.ts

This extends the base Hyva fixtures file. You can add your own fixtures here, or override the base ones.
`import { test as hyvaBase } from "@hyva/fixtures";` (you can always use `@hyva` to import from the base Hyva app folder)

As example, you can see the PPSHGomePage page class is imported ```import PPSHomePage from "../pages/home.page";``` and then we override the
base hyva ```homePage``` fixture with the PPS one. 

```
    homePage: async ({ page }, use, workerInfo) => {
        await use(new PPSHomePage(page, workerInfo));
    },
```

The PPSHomePage class then extends the base HYva HomePage and allows to override functions. 
This then allows PPS tests to re-use base Hyva functions, and replace others.

You can choose to import Hyva base locators/data json files, or local ones for changes in your app.
This way you can extend the base tests with you own data files.

If you simply create a data file in your app, with the same name as one in the base Hyva tests, your app data file will be loaded instead of the Hyva base one.
You don't need to do anything else there. So you can use your site data with the base hyva tests without changing the base hyva files, making it a lot easier to update from upstream.

This is achieved by dynamic imports in the base Hyva classes. You'd not need this in your app classes, unless you plan to have a base app, that is extended by other apps.

```
// dynamically import the test JSON data based on the APP_NAME env variable
// and if the file exixts in APP path, and if not default to teh base data
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


### Using Page classes for tests instead of placing tests directly in test files.

It is preferred to keep tests in 'pages' classes, and then call those from the test files.
This allows for extensibility

In your app, this is not really needed, unless you will have apps extending apps, and so on.

### Using the bootstrapped frameowrk actions

You will see the framework I based this work on has some utility actions and resources.
I use them in some places, and in others not.
I kind of moved away from using them, as I wanted to learn more on how to use playwright functionality natively, and using the actions did not teach me that.
I am at times swapping between the two. Depens on how I feel in that moment really. Is not important to me

You can watch this as it gives some more info on working: https://youtu.be/mz2zec4I18Q
You can also see a run of the current tests here: https://asciinema.org/a/KWSqlCqKqU4XXDP25K0f17WWT

## Acknowledgement

This project was bootstrapped with [Eric Stanley's Playwright Framework](https://github.com/eric-stanley/playwright-framework).
I had made quite a few changes how it works to accomodate my needs, and those are not upstream compatible with the original project, so this project now stands appart going forward.
Credit to Eric for his work.

## Example output

```$ APP_NAME=hyva NODE_ENV=dev playwright test

Running 48 tests using 5 workers

  ✓  1 [chromium] › home.spec.ts:10:9 › Home › it can navigate to the homepage (4.4s)
  ✓  2 [chromium] › cart.spec.ts:11:9 › Cart actions with one Item in cart › it can change the quantity in the cart  (12.4s)
  ✓  3 [chromium] › category.spec.ts:10:9 › Category Product List actions › Filters (18.4s)
  ✓  4 [firefox] › cart.spec.ts:11:9 › Cart actions with one Item in cart › it can change the quantity in the cart  (10.6s)
  ✓  5 [chromium] › sidecart_prices.spec.ts:7:9 › Side cart price check › it checks if the prices in the slider are displayed correctly (14.9s)
  ✓  6 [chromium] › home.spec.ts:14:9 › Home › it can perform search from homepage  (4.6s)
  ✓  7 [firefox] › category.spec.ts:10:9 › Category Product List actions › Filters (19.0s)
  ✓  8 [firefox] › cart.spec.ts:21:9 › Cart actions with one Item in cart › it can remove a product from the cart  (10.3s)
  ✓  9 [chromium] › cart.spec.ts:21:9 › Cart actions with one Item in cart › it can remove a product from the cart  (10.2s)
  ✓  10 [firefox] › home.spec.ts:10:9 › Home › it can navigate to the homepage (3.3s)
  ✓  11 [chromium] › category.spec.ts:14:9 › Category Product List actions › it can sort the products on price from lowest to highest (3.9s)
  ✓  12 [firefox] › home.spec.ts:14:9 › Home › it can perform search from homepage  (4.9s)
  ✓  13 [firefox] › cart.spec.ts:26:9 › Cart actions with one Item in cart › Displays the correct product prices and totals for simple product with no special price, and no shipping selected (8.1s)
  ✓  14 [chromium] › category.spec.ts:18:9 › Category Product List actions › it can sort the products on price from highest to lowest (4.9s)
  ✓  15 [chromium] › cart.spec.ts:26:9 › Cart actions with one Item in cart › Displays the correct product prices and totals for simple product with no special price, and no shipping selected (7.5s)
  ✓  16 [firefox] › sidecart_prices.spec.ts:7:9 › Side cart price check › it checks if the prices in the slider are displayed correctly (13.7s)
  ✓  17 [chromium] › category.spec.ts:22:9 › Category Product List actions › it can sort the products by name (a-z) (3.9s)
  ✓  18 [firefox] › category.spec.ts:14:9 › Category Product List actions › it can sort the products on price from lowest to highest (3.9s)
  ✓  19 [webkit] › cart.spec.ts:11:9 › Cart actions with one Item in cart › it can change the quantity in the cart  (15.9s)
  ✓  20 [webkit] › category.spec.ts:10:9 › Category Product List actions › Filters (23.1s)
  ✓  21 [chromium] › category.spec.ts:26:9 › Category Product List actions › it can sort the products by name (z-a) (5.0s)
  ✓  22 [firefox] › category.spec.ts:18:9 › Category Product List actions › it can sort the products on price from highest to lowest (4.9s)
  ✓  23 [chromium] › category.spec.ts:30:9 › Category Product List actions › it can change the number of displayed products (limiter) (5.7s)
  ✓  24 [firefox] › category.spec.ts:22:9 › Category Product List actions › it can sort the products by name (a-z) (4.4s)
  ✓  25 [webkit] › home.spec.ts:10:9 › Home › it can navigate to the homepage (3.3s)
  ✓  26 [chromium] › category.spec.ts:34:9 › Category Product List actions › it checks if the breadcrumb is displayed correctly (3.3s)
  ✓  27 [webkit] › home.spec.ts:14:9 › Home › it can perform search from homepage  (6.2s)
  ✓  28 [firefox] › category.spec.ts:26:9 › Category Product List actions › it can sort the products by name (z-a) (5.3s)
  ✓  29 [chromium] › category.spec.ts:38:9 › Category Product List actions › it can switch from list to grid view (4.8s)
  ✓  30 [webkit] › cart.spec.ts:21:9 › Cart actions with one Item in cart › it can remove a product from the cart  (12.6s)
  ✓  31 [firefox] › category.spec.ts:30:9 › Category Product List actions › it can change the number of displayed products (limiter) (5.9s)
  ✓  32 [webkit] › sidecart_prices.spec.ts:7:9 › Side cart price check › it checks if the prices in the slider are displayed correctly (16.5s)
  ✓  33 [chromium] › category.spec.ts:42:9 › Category Product List actions › it checks if the pagination is working (6.8s)
  ✓  34 [firefox] › category.spec.ts:34:9 › Category Product List actions › it checks if the breadcrumb is displayed correctly (3.0s)
  ✓  35 [webkit] › category.spec.ts:14:9 › Category Product List actions › it can sort the products on price from lowest to highest (4.2s)
  ✓  36 [firefox] › category.spec.ts:38:9 › Category Product List actions › it can switch from list to grid view (3.9s)
  ✓  37 [chromium] › category.spec.ts:46:9 › Category Product List actions › it can add multiple products to compare, and compare count indicators work. (9.4s)
  ✓  38 [webkit] › category.spec.ts:18:9 › Category Product List actions › it can sort the products on price from highest to lowest (5.6s)
  ✓  39 [webkit] › cart.spec.ts:26:9 › Cart actions with one Item in cart › Displays the correct product prices and totals for simple product with no special price, and no shipping selected (9.0s)
  ✓  40 [firefox] › category.spec.ts:42:9 › Category Product List actions › it checks if the pagination is working (7.5s)
  ✓  41 [webkit] › category.spec.ts:22:9 › Category Product List actions › it can sort the products by name (a-z) (4.1s)
  ✓  42 [webkit] › category.spec.ts:26:9 › Category Product List actions › it can sort the products by name (z-a) (5.1s)
  ✓  43 [firefox] › category.spec.ts:46:9 › Category Product List actions › it can add multiple products to compare, and compare count indicators work. (8.8s)
  ✓  44 [webkit] › category.spec.ts:30:9 › Category Product List actions › it can change the number of displayed products (limiter) (5.7s)
  ✓  45 [webkit] › category.spec.ts:34:9 › Category Product List actions › it checks if the breadcrumb is displayed correctly (3.2s)
  ✓  46 [webkit] › category.spec.ts:38:9 › Category Product List actions › it can switch from list to grid view (4.1s)
  ✓  47 [webkit] › category.spec.ts:42:9 › Category Product List actions › it checks if the pagination is working (7.3s)
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
