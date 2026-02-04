import { test, expect } from "@playwright/test";

const isBoolean = require("./isBoolean");

test.describe("is/isBoolean", () => {
  test("checks if a value is boolean", () => {
    expect(isBoolean(true)).toBe(true);

    expect(isBoolean(100)).toBe(false);
  });
});
