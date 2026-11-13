import { describe, expect, it } from "vitest";
import { estimateReadingTime } from "./reading-time";

const words = (count: number) => Array(count).fill("word").join(" ");

describe("estimateReadingTime", () => {
  it("rounds up to whole minutes", () => {
    expect(estimateReadingTime(words(250))).toBe("1 min");
    expect(estimateReadingTime(words(251))).toBe("2 min");
    expect(estimateReadingTime(words(2500))).toBe("10 min");
  });

  it("never returns less than one minute", () => {
    expect(estimateReadingTime("")).toBe("1 min");
    expect(estimateReadingTime("  \n ")).toBe("1 min");
  });
});
