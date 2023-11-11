# Magento 2 Hyva playwright tests

This project was bootstrapped with [Eric Stanley's Playwright Framework](https://github.com/eric-stanley/playwright-framework).
I had made quite a few changes how it works to accomodate my needs, and those are not upstream compatible with the original project, so this project now stands appart going forward.
Credit to Eric for his work.

## Instroduction

The goal of this project is to create an extensible Playwright tetsing environment for Magento 2 + Hyva projects.
The main focus is the ability to have a base set of Hyva tests, that can be extended upon by a sub git project for hyva based sites, without having to edit the base Hyva tests.
The ideal would then be that community driven tests can be added to expand the base Hyva tests, which can then be expanded on by each user to their own tests for their own sites tweaks.

Please see the vide here for an overview.

## Built as I went along

Please note that this project was built as I learnt playwright and other aspects. SOme thinsg may likely be improved upon, so feel free to join in and help improve.

I am certanly not an expert in anything playwright or js related!

## Things needed

* a matrix of tests / hyva features tested / outstanding

## Getting started

* Get a Linux/Mac box to work on. (no tested/used on windows)
* Clone this repo and cd into it.
* Run `npm install` to install dependencies
* Run `npm install playwright`
* Run `npx playwright install` to install playwright dependencies

## Running tests

At this point, you will be ready to run the base Hyva tests, against the Hyva example website.
Check the config file https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/config.json where you can
see the site urls defined. In this cas, they are all teh same. (you will make edits to this later when you setup your own app)

The -dev (as example is the environment used in commands below), so you can run tests against multiple hosts (live/uat/dev etc)
You can run: `npx yarn workspace hyva test-{environment}` in the root folder to run the tests. eg `yarn workspace hyva test-dev`

OR you can run it from the app base folder

* run `cd src/apps/hyva`
* run `npx yarn test-{environment}` where site corresponds to the site defined in the config file. eg `yarn test-dev`

You will see teh actual command run is: `APP_NAME=hyva NODE_ENV=dev playwright test`, so you can run it in the UI as well.
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

You can also set base Hyva tests to be skipped, for anything you don;t want, or had completely replaced (more on that below)

There is a bash script that will boostrap your app structure under src/apps/{yourappname} and add the needed files.
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
* run `cd ../../../` (which brings you back to teh main top level folder of teh repo)

Now you can run the tests for the pps app, against the Hyva demo site.

You will see in teh run, the base Hyva tests will run first, then after that the PPS (app) tests will run.

You will see some tests in teh base Hyva is skipped, as they were replaced with corresponding tests in the PPS app, or simply not wanted (as maybe the app don;t have that module/functionality installed)

You can skip tests by defining them in the config.json file, under the `skipBaseTests` key. (Still wanting for a better way, if any ideas :) )_
ref: https://github.com/ProxiBlue/pps-example-tests/blob/main/config.json#L7C4-L7C17

For this purpose, any tests added to teh base Hyva tests MUST start with a skip tests line, to allow that test to be skipped by any defined apps
```test.skip(process.env.skipBaseTests.includes(testInfo.title), "Test skipped for this environment: " + process.env.APP_NAME);```

I am still learning playwright, so maybe there is a better way to implement this idea!

So, from teh top level folder, run `npx yarn workspace pps test-live` to run the tests for the pps app, against the PPS site.
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

### Using Page classes for tests instead of placing tests directly in test files.

It is preferred to keep tests in 'pages' classes, and then call those from the test files.
This allows for extensibility

In your app, this is not really needed, unless you will have apps extending apps, and so on.

### Using the bootstrapped frameowrk actions

You will see the framework I based this work on has some utility actions and resources.
I use them in some places, and in others not.
I kind of moved away from using them, as I wanted to learn more on how to use playwright functionality natively, and using the actions did not teach me that.
I am at times swapping between the two. Depens on how I feel in that moment really. Is not important to me


---------------------------------------------

Original boostrap readme content below, left as it still applies.

This project was bootstrapped with [playwright](https://playwright.dev/).

Testing site used - [UI Testing Playground](http://uitestingplayground.com/)

For fast run, fork the [repo](https://github.com/inflectra/ui-test-automation-playground) and run it from local. Otherwise, change the below

| Key           | Value                             | File                                                 |
| ------------- | --------------------------------- | ---------------------------------------------------- |
| `env.*.url`   | `http://uitestingplayground.com/` | `src/apps/ui-testing-playground/config.json`         |
| `urlContains` | `uitestingplayground`             | `src/apps/ui-testing-playground/data/home.data.json` |

## :sparkles: Available Scripts

In the project directory, you can run:

| _Command_                        | _Description_                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| <code>**yarn**</code>            | to install dependencies (**_always run this first before running any other commands_**) |
| <code>**yarn test**</code>       | to run tests                                                                            |
| <code>**yarn test:debug**</code> | to run tests in `debug` mode                                                            |
| <code>**yarn report**</code>     | to serve default report                                                                 |
| <code>**yarn allure**</code>     | to serve allure report                                                                  |

**:exclamation:_Note:_** By default the tests are run in <code>headless</code> mode. Screenshots will not be captured in this mode as it causes problems during validation between headless and headed mode. For validating screenshots, change the below in <code>src/apps/ui-testing-playground/playwright.config.js</code>

| Field      | Value   |
| ---------- | ------- |
| `headless` | `false` |
| `retries`  | `0`     |

During the first run, the screenshots will be baselined and no validations will be done during this run. Once the run is complete, change the <code>retries</code> back to the number of retries you need.

Starting second run, the screenshots will be compared with the baseline screenshot.

#### For implementation of this framework for a brand new application. Check [here](https://www.stanleyeric.com/playwright-framework-implementation-part-1/)
