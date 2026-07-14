import { describe, expect, it } from "vitest";

import {
  parseFixtureSlugs,
  selectFixtureRepositories,
  type FixtureRepository,
} from "./check";

function repository(
  repoSlug: string,
  overrides: Partial<FixtureRepository> = {},
): FixtureRepository {
  return {
    id: `${repoSlug}-id`,
    vcs_provider: "github",
    org_slug: "fixture-org",
    repo_slug: repoSlug,
    default_branch: "main",
    archived: false,
    ...overrides,
  };
}

describe("parseFixtureSlugs", () => {
  it("accepts one repository slug", () => {
    expect(parseFixtureSlugs("provider")).toEqual(["provider"]);
  });

  it("accepts and trims a comma-separated pair", () => {
    expect(parseFixtureSlugs(" provider , consumer ")).toEqual(["provider", "consumer"]);
  });

  it("accepts a comma-separated three-repository chain", () => {
    expect(parseFixtureSlugs("library,middleware,consumer"))
      .toEqual(["library", "middleware", "consumer"]);
  });

  it.each([undefined, "", "   "])("rejects missing input: %s", (input) => {
    expect(() => parseFixtureSlugs(input)).toThrow("required");
  });

  it("rejects empty entries", () => {
    expect(() => parseFixtureSlugs("provider,")).toThrow("must not be empty");
  });

  it("rejects duplicate slugs", () => {
    expect(() => parseFixtureSlugs("provider,provider")).toThrow("must be unique");
  });

  it("rejects more than three slugs", () => {
    expect(() => parseFixtureSlugs("one,two,three,four")).toThrow("At most three");
  });
});

describe("selectFixtureRepositories", () => {
  it("returns exact matches in requested order", () => {
    const provider = repository("provider");
    const consumer = repository("consumer");
    expect(
      selectFixtureRepositories([consumer, provider], ["provider", "consumer"]),
    ).toEqual([provider, consumer]);
  });

  it("rejects a missing exact slug", () => {
    expect(() => selectFixtureRepositories([repository("Provider")], ["provider"]))
      .toThrow("Repository not found");
  });

  it("rejects an ambiguous slug", () => {
    expect(() =>
      selectFixtureRepositories(
        [
          repository("shared", { id: "one", org_slug: "org-one" }),
          repository("shared", { id: "two", org_slug: "org-two" }),
        ],
        ["shared"],
      )
    ).toThrow("Repository slug is ambiguous");
  });
});
