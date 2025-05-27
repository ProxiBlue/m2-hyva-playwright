import { test, expect } from "@playwright/test";

const isEven = require("./isEven");

test.describe("is/isEven", () => {
  test("checks if value is even", () => {
    expect(isEven(2)).toBe(true);

    expect(isEven(0)).toBe(true);

    expect(isEven(3)).toBe(false);

    expect(isEven(null)).toBe(false);

    expect(isEven({})).toBe(false);

    expect(isEven([])).toBe(false);

    expect(isEven(NaN)).toBe(false);

    expect(isEven(void 0)).toBe(false);
  });
});
