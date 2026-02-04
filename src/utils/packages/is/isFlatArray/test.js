import { test, expect } from "@playwright/test";

const isFlatArray = require("./isFlatArray");

test.describe("is/isFlatArray", () => {
  test("checks if a value is a flat array", () => {
    expect(isFlatArray([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(true);

    expect(isFlatArray([1, 2, [3], [4, 5], 6, 7, [8], 9])).toBe(false);

    expect(isFlatArray([[1, 2, 3]])).toBe(false);

    expect(isFlatArray(new Set())).toBe(false);

    expect(isFlatArray([])).toBe(true);

    expect(isFlatArray([new Array(3)])).toBe(false);

    expect(isFlatArray()).toBe(false);
  });
});
