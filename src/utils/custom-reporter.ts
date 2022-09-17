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
import colors from "colors";

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
    console.log(
      `Suite Title: ${suite.suites[0].suites[0].suites[0].title}`.underline.blue
        .bold
    );
    console.log(`Starting the run with ${suite.allTests().length} tests`.blue);
  }

  onEnd(result: FullResult): void | Promise<void> {
    console.log(
      `Finished the run:`.underline.blue.bold,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold
    );
  }

  onError(error: TestError): void {
    console.error(error.message.red);
  }

  onStdErr(
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void {
    typeof chunk === "string"
      ? console.log(chunk.red)
      : console.log(chunk.toString().red);
  }

  onStdOut(
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void {
    typeof chunk === "string"
      ? console.log(chunk.gray)
      : console.log(chunk.toString().gray);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step")
      console.log(`Started step: ${step.title}`.magenta);
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      console.log(`Finished step: ${step.title}`.cyan);
    }
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    console.log(`Started test: ${test.title}`.yellow);
    if (test.retries > 0 && result.status === "failed") {
      console.log(`Retrying ${test.title}...`.magenta);
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(`Finished test ${test.title}: ${result.status}`.green);
    if (result.status === "failed") {
      console.log(stripAnsi(result.error?.message.red ?? ""));
      console.log(stripAnsi(result.error?.stack.red ?? ""));
    }
  }

  printsToStdio(): boolean {
    return true;
  }
}
