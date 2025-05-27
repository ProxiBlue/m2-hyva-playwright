import { test, expect } from "@playwright/test";

const isNullish = require("./isNullish");

test.describe("is/isNullish", () => {
  let foo;

  test("checks if a value is null or undefined", () => {
    expect(isNullish()).toBe(true);

    expect(isNullish(foo)).toBe(true);

    expect(isNullish(null)).toBe(true);

    expect(isNullish({ foo: "bar" })).toBe(false);
  });
});
