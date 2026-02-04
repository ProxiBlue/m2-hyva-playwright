import { test, expect } from "@playwright/test";

const pascalCase = require("./pascalCase");

test.describe("String/pascalCase", () => {
  test("should convert string to pascal case", () => {
    expect(
      pascalCase(
        " () @#$ @# %the quick brown fox jumps over the lazy dog  #!#$% <> "
      )
    ).toBe("TheQuickBrownFoxJumpsOverTheLazyDog");

    expect(pascalCase("the quick brown fox jumps over the lazy dog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("the quick 😀 brown fox jumps over the lazy dog")).toBe(
      "TheQuick😀BrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("the quick brown fox jumps over the lazy dog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("the-quick-brown-fox-jumps-over-the-lazy-dog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("the_quick_brown_fox_jumps_over_the_lazy_dog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("thequickbrownfoxjumpsoverthelazydog")).toBe(
      "Thequickbrownfoxjumpsoverthelazydog"
    );

    expect(pascalCase("theQuickBrownFoxJumpsOverTheLazyDog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("TheQuickBrownFoxJumpsOverTheLazyDog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("The Quick Brown Fox Jumps Over The Lazy Dog")).toBe(
      "TheQuickBrownFoxJumpsOverTheLazyDog"
    );

    expect(pascalCase("theQUICKBrownFoxJumpsOverTheLazyDog")).toBe(
      "TheQUICKBrownFoxJumpsOverTheLazyDog"
    );

    expect(
      pascalCase(
        "the - quick ( * brown# )fox:> < jumps; % over , the ^ lazy & dog"
      )
    ).toBe("TheQuickBrownFoxJumpsOverTheLazyDog");

    expect(() => {
      return pascalCase(["the quick brown fox jumps over the lazy dog"]);
    }).toThrow(new TypeError("Expected a string for first argument"));
  });
});
