import { test, expect } from "@playwright/test";

const collapseWhitespace = require("./collapseWhitespace");

test.describe("String/collapseWhitespace", () => {
  test("Converts all adjacent whitespace characters to a single space.", () => {
    expect(collapseWhitespace("too   \n  much  \t whitespace")).toEqual(
      "too much whitespace"
    );

    expect(
      collapseWhitespace("\n\t too   \n  much  \t whitespace    ")
    ).toEqual("too much whitespace");

    expect(() => {
      return collapseWhitespace(null);
    }).toThrow(new TypeError("Expected a string for first argument"));
  });
});
