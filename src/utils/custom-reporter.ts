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

let totalTests = 0;
let i = 1;
const date = new Date();
export default class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    totalTests = suite.allTests().length;
    console.log(
      `${date.toLocaleString()}:`.bgCyan.white,
      ``,
      `Starting the run with ${totalTests} tests`.underline.blue.bold,
      "\n"
    );
  }

  onEnd(result: FullResult): void | Promise<void> {
    console.log(
      `${date.toLocaleString()}:`.bgCyan.white,
      ``,
      `Finished the run:`.underline.blue.bold,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold,
      "\n"
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
      console.log(
        `${date.toLocaleString()}:`.bgCyan.white,
        ` Started step: ${step.title}`.magenta
      );
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      console.log(
        `${date.toLocaleString()}:`.bgCyan.white,
        ` Finished step: ${step.title}`.cyan
      );
    }
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    console.log(
      `Test ${i} of ${totalTests} - ${test.parent.title}`.yellow.bold
    );
    if (result.retry === 0) {
      console.log(
        `${date.toLocaleString()}:`.bgCyan.white,
        ` Started test: ${test.title}`.yellow
      );
    } else {
      console.log(
        `${date.toLocaleString()}:`.bgCyan.white,
        ` Retrying... (attempt ${result.retry} of ${test.retries}): ${test.title}`
          .yellow
      );
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(
      `${date.toLocaleString()}:`.bgCyan.white,
      ` Finished test ${test.title}: `,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold,
      "\n"
    );
    if (result.status === "failed") {
      console.log(stripAnsi(result.error?.message.red ?? ""));
      console.log(stripAnsi(result.error?.stack.red ?? ""));
    }
    if (result.status === "passed" || result.retry === 3) i++;
  }

  printsToStdio(): boolean {
    return true;
  }
}
