import { test, expect } from "@playwright/test";

const before = require("./before");

test.describe("Function/before", () => {
  test("should invoke a function up to 5 times", () => {
    let count = 0;
    let result;

    const doSomething = before(6, (x) => (count += x));

    for (let i = 0; i < 10; i += 1) {
      result = doSomething(1);
    }

    expect(result).toEqual(5);

    expect(() => {
      return before("five", () => {
        return (count += 1);
      });
    }).toThrow(new TypeError("Expected a number for first argument"));

    expect(() => {
      return before(5);
    }).toThrow(new TypeError("Expected a function for second argument"));
  });
});
