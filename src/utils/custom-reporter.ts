import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";

export default class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    console.log("Suite Title: " + suite.suites[0].suites[0].suites[0].title);
  }

  onEnd(result: FullResult): void | Promise<void> {
    console.log("Suite run status: " + result.status);
  }

  onError(error: TestError): void {
    console.error(error.message);
  }

  onStdErr(
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void {
    console.error(chunk);
  }

  onStdOut(
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void {
    console.log(chunk);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step")
      console.log("Started step: " + step.title);
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      console.log("Completed step: " + step.title);
    }
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    console.log("Started test: " + test.title);
    if (test.retries > 0) {
      console.log(`${test.title} - Retrying!`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log("Completed test: " + test.title);
    console.log("Result: " + result.status);
    if (test.expectedStatus !== result.status) {
      console.log(test.title + " did not run as expected");
    }
  }

  printsToStdio(): boolean {
    return true;
  }
}
