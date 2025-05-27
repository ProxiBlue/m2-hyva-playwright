import { test, expect } from "@playwright/test";

const isMap = require("./isMap");

test.describe("is/isMap", () => {
  test("checks if a value is Map", () => {
    expect(isMap(new Map())).toBe(true);

    expect(isMap([])).toBe(false);

    expect(isMap({})).toBe(false);

    expect(isMap(void 0)).toBe(false);

    expect(isMap(null)).toBe(false);

    expect(isMap("foo")).toBe(false);
  });
});
