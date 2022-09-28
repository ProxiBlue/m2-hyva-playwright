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

let totalTests = 0;
let i = 1;

const ansiRegex = new RegExp(
  "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
  "g"
);
const stripAnsi = (str: string): string => str.replace(ansiRegex, "");

const getFormattedTime = () => `${new Date().toISOString()}`;

const roundSeconds = (seconds: number) =>
  Math.round((Math.abs(seconds) + Number.EPSILON) * 1000) / 1000;

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

let suiteStartTime: string, suiteEndTime: string;
let testStartTime: string, testEndTime: string;

export default class CustomReporter implements Reporter {
  onBegin = (config: FullConfig, suite: Suite): void => {
    suiteStartTime = getFormattedTime();
    totalTests = suite.allTests().length;
    console.log(
      `${getFormattedTime()}:`.bgCyan.black,
      ``,
      `Starting the run with ${suite.allTests().length} tests`.underline.blue
        .bold,
      "\n"
    );
  };

  onEnd = (result: FullResult): void | Promise<void> => {
    suiteEndTime = getFormattedTime();
    console.log(
      `${getFormattedTime()}:`.bgCyan.black,
      ``,
      `Finished the run with status`.underline.blue.bold,
      result.status === "passed"
        ? `${result.status}`.green.bold
        : `${result.status}`.red.bold,
      `\n\nOverall run duration: ${getDuration(suiteStartTime, suiteEndTime)}`
        .yellow.bold
    );
  };

  onError = (error: TestError): void => console.error(error.message.red);

  onStdErr = (
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void =>
    typeof chunk === "string"
      ? console.log(chunk.red)
      : console.log(chunk.toString().red);

  onStdOut = (
    chunk: string | Buffer,
    test: void | TestCase,
    result: void | TestResult
  ): void =>
    typeof chunk === "string"
      ? console.log(chunk.gray)
      : console.log(chunk.toString().gray);

  onStepBegin = (test: TestCase, result: TestResult, step: TestStep): void =>
    step.category === "test.step" &&
    console.log(
      `${getFormattedTime()}:`.bgCyan.black,
      ` Started step: ${step.title}`.magenta
    );

  onStepEnd = (test: TestCase, result: TestResult, step: TestStep): void =>
    step.category === "test.step" &&
    console.log(
      `${getFormattedTime()}:`.bgCyan.black,
      ` Finished step: ${step.title}`.cyan
    );

  onTestBegin = (test: TestCase, result: TestResult): void => {
    testStartTime = getFormattedTime();
    console.log(
      `Test ${i} of ${totalTests} - ${test.parent.title}`.yellow.bold
    );
    result.retry === 0
      ? console.log(
          `${getFormattedTime()}:`.bgCyan.black,
          ` Started test`,
          `${test.title}`.yellow
        )
      : console.log(
          `${getFormattedTime()}:`.bgCyan.black,
          ` Retrying test... (attempt ${result.retry} of ${test.retries})`,
          `${test.title}`.yellow
        );
  };

  onTestEnd = (test: TestCase, result: TestResult): void => {
    testEndTime = getFormattedTime();
    console.log(
      `${getFormattedTime()}:`.bgCyan.black,
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
  };

  printsToStdio = (): boolean => true;
}
