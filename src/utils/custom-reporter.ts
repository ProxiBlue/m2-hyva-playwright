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

process.env.FORCE_COLOR = "true";

const ansiRegex = new RegExp(
  "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
  "g"
);
function stripAnsi(str: string): string {
  return str.replace(ansiRegex, "");
}

export default class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    console.log("Suite Title: " + suite.suites[0].suites[0].suites[0].title);
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onEnd(result: FullResult): void | Promise<void> {
    console.log(`Finished the run: ${result.status}`);
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
    if (test.retries > 0 && result.status === "failed") {
      console.log(`${test.title} - Retrying!`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(`Finished test ${test.title}: ${result.status}`);
    if (result.status === "failed") {
      console.log(stripAnsi(result.error?.message ?? ""));
      console.log(stripAnsi(result.error?.stack ?? ""));
    }
  }

  printsToStdio(): boolean {
    return true;
  }
}
