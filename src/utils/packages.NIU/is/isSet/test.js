import { test, expect } from "@playwright/test";

const isSet = require("./isSet");

test.describe("is/isSet", () => {
  test("checks if a value is WeakMap", () => {
    expect(isSet(new Set())).toBe(true);

    expect(isSet([])).toBe(false);

    expect(isSet({})).toBe(false);

    expect(isSet(void 0)).toBe(false);

    expect(isSet(null)).toBe(false);

    expect(isSet("foo")).toBe(false);
  });
});
