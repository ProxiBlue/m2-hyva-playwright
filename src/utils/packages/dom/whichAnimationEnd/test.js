import { test, expect } from "@playwright/test";

const whichAnimationEnd = require("./whichAnimationEnd");

test.describe("dom/whichAnimationEnd", () => {
  test("returns the animation end event name", () => {
    const values = [
      "animationend",
      "oAnimationEnd",
      "webkitAnimationEnd",
      undefined,
    ];
    const exists = values.indexOf(whichAnimationEnd()) !== -1;

    expect(exists).toBe(true);
  });
});
