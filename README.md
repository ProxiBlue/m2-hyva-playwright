# Magento 2 Hyva playwright tests

This project was bootstrapped with [Eric Stanley's Playwright Framework](https://github.com/eric-stanley/playwright-framework).

## Instroduction

The goal of this project is to create an extensible Playwright tetsing environment for Magento 2 + Hyva projects.
The main focus is the ability to have a base set of Hyva tests, that can be extended upon by a sub git project for hyva based sites, without having to edit the base Hyva tests.
The ideal would then be that community driven tests can be added to expand the base Hyva tests, which can then be expanded on by each user to their own tests for their own sites tweaks.

Please see the vide here for an overview.

## Built as I went along

Please note that this project was built as I learnt playwright and other aspects. SOme thinsg may likely be improved upon, so feel free to join in and help improve.

I am not an expert in anything!

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

you can see teh commands are in the package.json scripts section for each app. Example: https://github.com/ProxiBlue/m2-hyva-playwright/blob/main/src/apps/hyva/package.json

## Adding your own tests for your app

Ok, so great, but not very helpful to run tests against the Hyva demo store. So let's add your own app.

The idea behind this setup is to have your apps as sub-git projects under the src/app folder.

This allows you to have your own tests, and not have to worry about them being overwritten when you update the base Hyva tests.

The test in your apps will extend the tests in the Hyva base, for those that need to be tweaked, or just run the base Hyva ones, but against your site.

You can also set base Hyva tests to be skipped, for anything you don;t want, or had completely replaced (more on that below)

There is a bash script that will boostrap your app structure under src/apps/{yourappname} and add the needed files.
You can run it from the root folder with `./bootstrapNewApp.sh {yourappname}` (no spaces in app name)
This will initialise a blank git repo to allow you add and commit your tests to your own (private) repo.
You will need to add in your own remote to push commits to. (I am assuming you know how to do all that using GIT)








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
