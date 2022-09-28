import { test, expect } from "@playwright/test";

const once = require("./once");

test.describe("Function/once", () => {
  test("should execute a function only one time", () => {
    const fn = jest.fn();
    const canOnlyFireOnce = once(fn);

    canOnlyFireOnce("foo");
    canOnlyFireOnce("bar");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("foo");

    expect(() => {
      once(null)();
    }).toThrow(new TypeError("Expected a function for first argument"));
  });
});
