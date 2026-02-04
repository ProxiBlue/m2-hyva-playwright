import { test, expect } from "@playwright/test";

const whichTransitionEnd = require("./whichTransitionEnd");

test.describe("dom/whichTransitionEnd", () => {
  test("returns the transition end event name", () => {
    const values = [
      "transitionend",
      "oTransitionEnd",
      "webkitTransitionEnd",
      undefined,
    ];
    const exists = values.indexOf(whichTransitionEnd()) !== -1;

    expect(exists).toBe(true);
  });
});
