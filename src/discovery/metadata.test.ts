import { describe, expect, it } from "vitest";

import { detectBuildSystem, toPrimaryLanguages } from "./metadata";

describe("toPrimaryLanguages", () => {
  it("converts GitHub byte counts into language percentages", () => {
    expect(toPrimaryLanguages({ TypeScript: 750, JavaScript: 250 })).toEqual([
      { language: "TypeScript", loc: 750, pct: 75 },
      { language: "JavaScript", loc: 250, pct: 25 },
    ]);
  });

  it("handles an empty language response", () => {
    expect(toPrimaryLanguages({})).toEqual([]);
  });
});

describe("detectBuildSystem", () => {
  it.each([
    ["package.json", "npm"],
    ["go.mod", "go_mod"],
    ["requirements.txt", "pip"],
    ["pyproject.toml", "pip"],
    ["pom.xml", "maven"],
    ["build.gradle", "gradle"],
    ["Cargo.toml", "cargo"],
    ["Service.csproj", "dotnet"],
  ])("detects %s as %s", (file, expected) => {
    expect(detectBuildSystem([file])).toBe(expected);
  });

  it("detects markers inside known one-level directory listings", () => {
    expect(detectBuildSystem(["backend/go.mod"])).toBe("go_mod");
  });

  it("returns mixed when multiple build systems match", () => {
    expect(detectBuildSystem(["package.json", "server/go.mod"])).toBe("mixed");
  });

  it("returns null when no build system matches", () => {
    expect(detectBuildSystem(["README.md"])).toBeNull();
  });
});
