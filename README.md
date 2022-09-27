This project was bootstrapped with [playwright](https://playwright.dev/).

Testing site used - [UI Testing Playground](http://uitestingplayground.com/)

For fast run, fork the [repo](https://github.com/inflectra/ui-test-automation-playground) and run it from local. Otherwise change the '<code>url</code>' and '<code>urlContains</code>' as below in <code>data/apps/ui-testing-playground/home/data.json</code>

| Key         | Value                           |
| ----------- | ------------------------------- |
| url         | http://uitestingplayground.com/ |
| urlContains | uitestingplayground             |

## Available Scripts

In the project directory, you can run:

<code>**yarn**</code> - to install dependencies (**always run this first before running any other commands**)

<code>**yarn test**</code> - to run tests

<code>**yarn test:debug**</code> - to run tests in `debug` mode

<code>**yarn report**</code> - to serve default report

<code>**yarn allure**</code> - to serve allure report

**Note:**
By default the tests are run in headless mode. Screenshots will not be captured in this mode as it causes problems during validation between headless and headed mode. For validating screenshots, change <code>headless</code> to <code>true</code> and <code>retries</code> to <code>0</code> in <code>playwright.config.js</code>

During the first run, the screenshots will fail, since there will not be any screenshots to match and the baseline screenshots will be taken during the first run. Once the run is complete, change the <code>retries</code> back to the number of retries you need.
