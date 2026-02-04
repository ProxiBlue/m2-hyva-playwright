import { test, expect } from "@playwright/test";

const isArray = require("./isArray");

test.describe("is/isArray", () => {
  const runTests = () => {
    expect(isArray(["a", "b", "c", "d"])).toBe(true);

    expect(isArray({ a: "a", b: "b" })).toBe(false);

    expect(isArray("abcdefg")).toBe(false);

    expect(isArray(null)).toBe(false);

    expect(isArray(undefined)).toBe(false);
  };

  test("checks if value is array (Array.isArray is supported)", () => {
    runTests();
  });

  test("checks if value is array (Array.isArray is not supported)", () => {
    const nativeCode = Array.isArray;
    Array.isArray = null;
    runTests();
    Array.isArray = nativeCode;
  });
});
