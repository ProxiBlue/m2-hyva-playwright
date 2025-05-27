import { test, expect } from "@playwright/test";

const shuffle = require("./shuffle");

test.describe("Array/shuffle", () => {
  test("shuffles an array", () => {
    const arr = ["a", "b", "c", "d", "e", "f", "g", "h"];

    expect(shuffle(arr)).toHaveLength(8);

    expect(shuffle(arr)).not.toEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);

    expect(() => {
      return shuffle({ a: "a", b: "b", c: "c" });
    }).toThrow(new TypeError("Expected an array for first argument"));
  });
});
