import { test, expect } from "@playwright/test";

const isWeakMap = require("./isWeakMap");

test.describe("is/isWeakMap", () => {
  test("checks if a value is WeakMap", () => {
    expect(isWeakMap(new WeakMap())).toBe(true);

    expect(isWeakMap([])).toBe(false);

    expect(isWeakMap({})).toBe(false);

    expect(isWeakMap(void 0)).toBe(false);

    expect(isWeakMap(null)).toBe(false);

    expect(isWeakMap("foo")).toBe(false);
  });
});
