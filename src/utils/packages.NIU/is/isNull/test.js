import { test, expect } from "@playwright/test";

const isNull = require("./isNull");

test.describe("is/isNull", () => {
  test("checks if a valud is null", () => {
    expect(isNull(null)).toBe(true);

    expect(isNull(100)).toBe(false);

    expect(isNull()).toBe(false);
  });
});
