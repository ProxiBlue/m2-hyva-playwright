import { test, expect } from "@playwright/test";

const isDate = require("./isDate");

test.describe("is/isDate", () => {
  test("checks if a value is Date object", () => {
    expect(isDate(new Date())).toBe(true);

    expect(isDate(new Date().getTime())).toBe(false);
  });
});
