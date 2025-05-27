import { test, expect } from "@playwright/test";

const isElement = require("./isElement");

test.describe("is/isElement", () => {
  test("checks if a value is DOM element", () => {
    expect(isElement(document.getElementsByTagName("head")[0])).toBe(true);

    expect(isElement("Lorem")).toBe(false);
  });
});
