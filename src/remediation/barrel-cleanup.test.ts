import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { cleanupBarrelReexports } from "./barrel-cleanup";

async function fixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dca-barrel-cleanup-"));
  for (const [path, content] of Object.entries(files)) {
    const absolutePath = join(root, path);
    await mkdir(join(absolutePath, ".."), { recursive: true });
    await writeFile(absolutePath, content);
  }
  return root;
}

describe("cleanupBarrelReexports", () => {
  it("removes an export-star and an unused consumer import while preserving peers", async () => {
    const root = await fixture({
      "src/utils/formatName.ts": "",
      "src/utils/formatDate.ts": "export function formatDate() { return 'date'; }\n",
      "src/utils/index.ts": [
        "export * from \"./formatDate\";",
        "export * from \"./formatName\";",
        "",
      ].join("\n"),
      "src/app.ts": [
        "import { formatDate, formatName } from \"./utils\";",
        "console.log(formatDate());",
        "",
      ].join("\n"),
    });

    const result = await cleanupBarrelReexports(root, "src/utils/formatName.ts", "formatName");

    expect(result).toEqual({
      changedFiles: ["src/app.ts", "src/utils/formatName.ts", "src/utils/index.ts"],
      removedReexports: 1,
      removedImports: 1,
    });
    expect(await readFile(join(root, "src/utils/index.ts"), "utf8")).toBe(
      "export * from \"./formatDate\";\n",
    );
    expect(await readFile(join(root, "src/app.ts"), "utf8")).toContain(
      'import { formatDate } from "./utils";',
    );
  });

  it("removes a named re-export without touching unrelated export statements", async () => {
    const root = await fixture({
      "src/formatName.ts": "",
      "src/formatDate.ts": "export function formatDate() { return 'date'; }\n",
      "src/index.ts": [
        "export { formatName } from \"./formatName\";",
        "export { formatDate } from \"./formatDate\";",
        "",
      ].join("\n"),
      "src/app.ts": "import { formatName } from \"./index\";\nconsole.log('still valid');\n",
    });

    const result = await cleanupBarrelReexports(root, "src/formatName.ts", "formatName");

    expect(result.removedReexports).toBe(1);
    expect(result.removedImports).toBe(1);
    expect(await readFile(join(root, "src/index.ts"), "utf8")).toBe(
      "export { formatDate } from \"./formatDate\";\n",
    );
    expect(await readFile(join(root, "src/app.ts"), "utf8")).toBe("console.log('still valid');\n");
  });

  it("refuses to remove an import when the consumer still uses the symbol", async () => {
    const root = await fixture({
      "src/formatName.ts": "",
      "src/index.ts": "export * from \"./formatName\";\n",
      "src/app.ts": "import { formatName } from \"./index\";\nconsole.log(formatName('Ada'));\n",
    });

    await expect(
      cleanupBarrelReexports(root, "src/formatName.ts", "formatName"),
    ).rejects.toThrow("Cannot remove used import formatName");
  });
});
