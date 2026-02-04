import { test, expect } from "@playwright/test";

const isString = require("./isString");

test.describe("is/isString", () => {
  test("checks if a value is string", () => {
    expect(isString("404")).toBe(true);

    expect(isString(404)).toBe(false);

    expect(isString({})).toBe(false);

    expect(isString(["a", "b"])).toBe(false);

    expect(isString(null)).toBe(false);

    expect(isString(String("lorem ipsum"))).toBe(true);
  });
});
