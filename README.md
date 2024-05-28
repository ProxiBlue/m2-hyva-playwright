# Magento 2 Hyva playwright tests

## Instroduction

The goal of this project is to create an extensible Playwright testing environment for Magento 2 + Hyva projects.
The main focus of this project was to: 

* have a base set of Hyva tests, which can be extended / updated by community members without affecting your own site specific tests
* Have a set of sub-tests (site tests) on a private repo that you can layer 'ontop' of the base hyva tests.

This process will ease the pain of updaing the base tests and not have merge conflict hell each time you update the base HYva tests 
as you will have no need to adjust those tests in any way. (unless the point is to contribute updates/new tests)

## Built as I went along / Learning

Please note that this project was built as I learnt playwright and other aspects. 
Some things may likely be improved upon, and be changed, so feel free to join in and help improve.
I figured I can put the idea forward even though not many tests exists as yet. It is a WIP.

I am certanly not an expert in anything playwright or js related!

## Things needed

* a matrix of tests / hyva features tested / outstanding

## Getting started

* Get a Linux/Mac box to work on. (no tested/used on windows) (using playwright dockers makes it easier, as all needed packages are installed)
* Create a folder called 'tests' (case MaTTeRs) and cd into it.
* Clone this repo and cd into it. ```git clone git@github.com:ProxiBlue/m2-hyva-playwright.git```
* You need to end up in a folder ```tests/m2-hyva-playwright```
* Run `npm install` to install dependencies
* Run `npm install playwright`
* Run `yarn run playwright install --with-deps` to install playwright and browser dependencies
* craete a folder for allure test results: ```mkdir -p ./src/apps/hyva/reports/allure/allure-result```
## Running tests

At this point, you will be ready to run the base Hyva tests, against the Hyva example website.
Check the config file https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/config.json where you can
see the site urls defined. In this cas, they are all the same. (you will make edits to this later when you setup your own app)

You can run tests against multiple hosts (live/uat/dev etc)
You can run: `npx yarn workspace hyva test-{environment}` in the root folder to run the tests. eg `yarn workspace hyva test-dev`

OR you can run it from the app base folder

* run `cd src/apps/hyva`
* run `npx yarn test-{environment}` where site corresponds to the site defined in the config file. eg `yarn test-dev`

You will see the actual command run is: `APP_NAME=hyva NODE_ENV=dev playwright test`, so you can run it in the UI as well.
`APP_NAME=hyva NODE_ENV=dev npx playwright test --ui`
OR remove headless
`APP_NAME=hyva NODE_ENV=dev npx playwright test --headed`

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

