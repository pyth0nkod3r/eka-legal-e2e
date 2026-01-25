import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("merges class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("handles false conditional classes", () => {
    const isActive = false;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base");
  });

  it("handles undefined values", () => {
    const result = cn("base", undefined, "other");
    expect(result).toBe("base other");
  });

  it("handles null values", () => {
    const result = cn("base", null, "other");
    expect(result).toBe("base other");
  });

  it("merges tailwind classes correctly", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles conflicting tailwind classes", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("handles arrays of classes", () => {
    const result = cn(["class1", "class2"]);
    expect(result).toBe("class1 class2");
  });

  it("handles objects with conditional classes", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe("base active");
  });

  it("handles empty arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles complex mixed inputs", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      "base-class",
      "base-class",
      isActive && "conditional",
      isDisabled && "excluded",
      ["array-class"],
      { "object-class": true, "excluded-class": false }
    );
    expect(result).toBe("base-class conditional array-class object-class");
  });
});
