import { test, expect } from "@playwright/test";

const isHexadecimal = require("./isHexadecimal");

test.describe("is/isHexadecimal", () => {
  test("checks if a value is hexadecimal", () => {
    expect(isHexadecimal("f5f5f5")).toBe(true);

    expect(isHexadecimal("9c0")).toBe(true);

    expect(isHexadecimal("something")).toBe(false);

    expect(isHexadecimal(333)).toBe(true);

    expect(isHexadecimal(6.6)).toBe(false);
  });
});
