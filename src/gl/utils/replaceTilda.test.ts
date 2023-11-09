import { expect, it, describe } from "bun:test";
import { replaceTilda } from "./replaceTilda";

describe("replaceTilda", () => {
  it("replaces variables starting with ~", () => {
    const inputString = "Testing ~{var} testing";
    const replacementMap = { var: "123" };
    const result = replaceTilda(inputString, replacementMap);
    expect(result).toBe("Testing 123 testing");
  });

  it("leaves non-matching variables unchanged", () => {
    const inputString = "Testing ~{var} testing ~{var2}";
    const replacementMap = { var: "123" };
    const result = replaceTilda(inputString, replacementMap);
    expect(result).toBe("Testing 123 testing ~{var2}");
  });

  it("handles undefined replacementMap", () => {
    const inputString = "Testing ~{var} testing";
    const result = replaceTilda(inputString);
    expect(result).toBe(inputString);
  });
});
