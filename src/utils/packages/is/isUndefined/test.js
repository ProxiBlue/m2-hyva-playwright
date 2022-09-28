import { test, expect } from "@playwright/test";

const isUndefined = require("./isUndefined");

test.describe("is/isUndefined", () => {
  let foo;

  test("checks if a value is undefined", () => {
    expect(isUndefined()).toBe(true);

    expect(isUndefined(foo)).toBe(true);

    expect(isUndefined(null)).toBe(false);

    expect(isUndefined(100)).toBe(false);
  });
});
