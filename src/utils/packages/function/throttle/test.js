import { test, expect } from "@playwright/test";

const throttle = require("./throttle");

test.describe("Function/throttle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("limits the number of times a function can be called in a given period", () => {
    const func = jest.fn();
    const throttled = throttle(func);

    throttled();
    throttled();

    expect(setTimeout).toHaveBeenCalledTimes(1);

    expect(func).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(200);

    throttled();

    expect(setTimeout).toHaveBeenCalledTimes(2);
  });

  test("throws if first argument is not a function", () => {
    expect(() => {
      return throttle();
    }).toThrow(new TypeError("Expected a function for first argument"));
  });
});
