import { describe, expect, it } from "vitest";

import { scipNpmEnvironment } from "./scip-typescript";

describe("scipNpmEnvironment", () => {
  it("removes inherited allow-scripts settings and preserves other npm config", () => {
    const env = scipNpmEnvironment({
      npm_config_allow_scripts: "win-ca",
      NPM_CONFIG_ALLOW_SCRIPTS: "win-ca",
      npm_config_registry: "https://registry.example.test",
      CI: "true",
    });

    expect(env.npm_config_allow_scripts).toBeUndefined();
    expect(env.NPM_CONFIG_ALLOW_SCRIPTS).toBeUndefined();
    expect(env.npm_config_registry).toBe("https://registry.example.test");
    expect(env.CI).toBe("true");
  });
});
