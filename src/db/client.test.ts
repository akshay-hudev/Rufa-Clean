import { describe, expect, it, vi } from "vitest";

import { createLazyPool } from "./client";

describe("lazy database client", () => {
  it("does not require configuration or create a pool at import/construction time", () => {
    const createPool = vi.fn();
    const lazy = createLazyPool({
      connectionString: () => undefined,
      createPool,
    });

    expect(createPool).not.toHaveBeenCalled();
    expect(() => lazy.query("SELECT 1")).toThrow(
      /DATABASE_URL is required when database functionality is invoked/,
    );
    expect(createPool).not.toHaveBeenCalled();
  });

  it("initializes once only when a database operation is invoked", async () => {
    const query = vi.fn(async () => ({ rows: [{ value: 1 }] }));
    const end = vi.fn(async () => undefined);
    const createPool = vi.fn(() => ({ query, end }) as never);
    const lazy = createLazyPool({
      connectionString: () => "postgresql://local.invalid/disposable",
      createPool,
    });

    expect(createPool).not.toHaveBeenCalled();
    await lazy.query("SELECT 1");
    await lazy.query("SELECT 2");
    expect(createPool).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledTimes(2);
    await lazy.end();
    expect(end).toHaveBeenCalledOnce();
  });

  it("allows cleanup after a missing-configuration failure", async () => {
    const lazy = createLazyPool({ connectionString: () => undefined });
    expect(() => lazy.query("SELECT 1")).toThrow(/DATABASE_URL is required/);
    await expect(lazy.end()).resolves.toBeUndefined();
  });
});
