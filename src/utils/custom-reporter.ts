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

const getFormattedTime = () => {
  const date = new Date();
  return `${date.toISOString()}`;
};

const roundSeconds = (seconds: number) => {
  return Math.round((Math.abs(seconds) + Number.EPSILON) * 1000) / 1000;
};

const getDuration = (startTime: string, endTime: string) => {
  const firstDateInSeconds = new Date(startTime).getTime() / 1000;
  const secondDateInSeconds = new Date(endTime).getTime() / 1000;
  const difference = roundSeconds(firstDateInSeconds - secondDateInSeconds);
  if (difference < 60) {
    return `${difference} ${difference > 1 ? "seconds" : "second"}`;
  } else if (difference < 3600) {
    const minutes = Math.floor(difference / 60);
    let seconds = difference - minutes * 60;
    seconds = roundSeconds(seconds);
    return `${minutes} ${minutes > 1 ? "minutes" : "minute"} ${seconds} ${
      difference > 1 ? "seconds" : "second"
    }`;
  } else {
    const hours = Math.floor(difference / 3600);
    let seconds = difference - hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    seconds = roundSeconds(seconds);
    return `${hours} ${hours > 1 ? "hours" : "hour"} ${minutes} ${
      minutes > 1 ? "minutes" : "minute"
    } ${seconds} ${difference > 1 ? "seconds" : "second"}`;
  }
};

let suiteStartTime: string, suiteEndTime;
let testStartTime: string, testEndTime: string;

export default class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    suiteStartTime = getFormattedTime();
    totalTests = suite.allTests().length;
    console.log(
      `${suiteStartTime}:`.bgCyan.white,
      ``,
      `Starting the run with ${totalTests} tests`.underline.blue.bold,
      "\n"
    );
  }

  onEnd(result: FullResult): void | Promise<void> {
    suiteEndTime = getFormattedTime();
    console.log(
      `${suiteEndTime}:`.bgCyan.white,
      ``,
      `Finished the run with status`.underline.blue.bold,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold,
      `\n\nOverall run duration: ${getDuration(suiteStartTime, suiteEndTime)}`
        .yellow.bold
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
        `${getFormattedTime()}:`.bgCyan.white,
        ` Started step: ${step.title}`.magenta
      );
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      console.log(
        `${getFormattedTime()}:`.bgCyan.white,
        ` Finished step: ${step.title}`.cyan
      );
    }
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    testStartTime = getFormattedTime();
    console.log(
      `Test ${i} of ${totalTests} - ${test.parent.title}`.yellow.bold
    );
    if (result.retry === 0) {
      console.log(
        `${getFormattedTime()}:`.bgCyan.white,
        ` Started test`,
        `${test.title}`.yellow
      );
    } else {
      console.log(
        `${getFormattedTime()}:`.bgCyan.white,
        ` Retrying... (attempt ${result.retry} of ${test.retries}): ${test.title}`
          .yellow
      );
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    testEndTime = getFormattedTime();
    console.log(
      `${getFormattedTime()}:`.bgCyan.white,
      ` Finished test`,
      `${test.title}`.yellow,
      `with status`,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold,
      `\n\nTest duration: ${getDuration(testStartTime, testEndTime)}\n`
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
