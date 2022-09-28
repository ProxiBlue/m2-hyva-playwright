import { test, expect } from "@playwright/test";

const isWeakSet = require("./isWeakSet");

test.describe("is/isWeakSet", () => {
  test("checks if a value is WeakMap", () => {
    expect(isWeakSet(new WeakSet())).toBe(true);

    expect(isWeakSet([])).toBe(false);

    expect(isWeakSet({})).toBe(false);

    expect(isWeakSet(void 0)).toBe(false);

    expect(isWeakSet(null)).toBe(false);

    expect(isWeakSet("foo")).toBe(false);
  });
});
