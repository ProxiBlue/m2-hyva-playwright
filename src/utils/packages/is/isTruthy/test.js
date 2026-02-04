import { test, expect } from "@playwright/test";

const isTruthy = require("./isTruthy");

test.describe("is/isTruthy", () => {
  test("checks if a value is truthy", () => {
    expect(isTruthy(true)).toBe(true);

    expect(isTruthy(" ")).toBe(true);

    expect(isTruthy({ foo: "bar" })).toBe(true);

    expect(isTruthy(false)).toBe(false);

    expect(isTruthy(NaN)).toBe(false);

    expect(isTruthy()).toBe(false);

    expect(isTruthy(0)).toBe(false);

    expect(isTruthy(-0)).toBe(false);

    expect(isTruthy(BigInt(0))).toBe(false);

    expect(isTruthy("")).toBe(false);
  });
});
