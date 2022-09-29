This project was bootstrapped with [playwright](https://playwright.dev/).

Testing site used - [UI Testing Playground](http://uitestingplayground.com/)

For fast run, fork the [repo](https://github.com/inflectra/ui-test-automation-playground) and run it from local. Otherwise, change the below

| Key           | Value                           | File                                             |
| ------------- | ------------------------------- | ------------------------------------------------ |
| `env.*.url`   | http://uitestingplayground.com/ | `config/apps/ui-testing-playground/config.json`  |
| `urlContains` | uitestingplayground             | `data/apps/ui-testing-playground/home/data.json` |

## :sparkles: Available Scripts

In the project directory, you can run:

| _Command_                        | _Description_                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| <code>**yarn**</code>            | to install dependencies (**_always run this first before running any other commands_**) |
| <code>**yarn test**</code>       | to run tests                                                                            |
| <code>**yarn test:debug**</code> | to run tests in `debug` mode                                                            |
| <code>**yarn report**</code>     | to serve default report                                                                 |
| <code>**yarn allure**</code>     | to serve allure report                                                                  |

**:exclamation:_Note:_** By default the tests are run in <code>headless</code> mode. Screenshots will not be captured in this mode as it causes problems during validation between headless and headed mode. For validating screenshots, change the below in <code>playwright.config.js</code>

| Field      | Value   |
| ---------- | ------- |
| `headless` | `false` |
| `retries`  | `0`     |

During the first run, the screenshots will be baselined and no validations will be done during this run. Once the run is complete, change the <code>retries</code> back to the number of retries you need.

Starting second run, the screenshots will be compared with the baseline screenshot.
