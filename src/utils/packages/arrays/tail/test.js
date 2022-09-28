import { test, expect } from "@playwright/test";

const tail = require("./tail");

test.describe("Array/tail", () => {
  test("Gets all but the first element of array", () => {
    expect(tail([1, 2, 3])).toEqual([2, 3]);

    expect(tail([1])).toEqual([]);

    expect(tail([])).toEqual([]);

    expect(() => {
      return tail({});
    }).toThrow(new TypeError("Expected an array for first argument"));
  });
});
