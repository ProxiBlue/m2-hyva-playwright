import { test, expect } from "@playwright/test";

const isFalse = require("./isFalse");

test.describe("is/isFalse", () => {
  test("checks if a value is false", () => {
    expect(isFalse(false)).toBe(true);

    expect(isFalse(true)).toBe(false);

    expect(isFalse()).toBe(false);
  });
});
