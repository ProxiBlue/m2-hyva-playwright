import { test, expect } from "@playwright/test";

const isRegexp = require("./isRegexp");

test.describe("is/isRegexp", () => {
  test("checks if a value is a regular expression", () => {
    expect(isRegexp(/^[0-9a-fA-F]+$/)).toBe(true);

    expect(isRegexp("/^[0-9a-fA-F]+$/")).toBe(false);

    expect(isRegexp()).toBe(false);
  });
});
