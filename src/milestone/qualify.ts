import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import ts from "typescript";

import { digestCanonical, sha256 } from "./canonical";
import type { RepositoryIdentity } from "./types";

export type QualificationStatus = "ready" | "unsupported" | "blocked" | "invalid";

export interface QualificationToolchain {
  node: {
    version: string;
    executable: string;
    source: "approved_runner";
  };
  npm: {
    version: string;
    executable: string;
    source: "approved_runner";
  };
  typescript: {
    version: string;
    executable: string;
    source: "project_local";
  };
}

export interface QualifiedModule {
  moduleId: string;
  path: string;
  contentSha256: string;
  sourceKind: "authored_production" | "authored_test" | "generated" | "declaration";
}

export interface TypeScriptQualification {
  schemaVersion: "1";
  status: QualificationStatus;
  repository: RepositoryIdentity;
  commitSha: string;
  packageName?: string;
  packageVersion?: string;
  packageIdentity?: string;
  sourceRoot?: string;
  packageJsonSha256?: string;
  packageLockSha256?: string;
  tsconfigSha256?: string;
  toolchain: QualificationToolchain;
  commands: {
    install: string[];
    typecheck?: string;
    build?: string;
    test?: string;
  };
  modules: QualifiedModule[];
  reasons: string[];
  qualificationDigest: string;
}

interface PackageManifest {
  name?: unknown;
  version?: unknown;
  workspaces?: unknown;
  packageManager?: unknown;
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
}

function portable(path: string): string {
  return path.split(sep).join("/");
}

function major(version: string): number | undefined {
  const match = /^v?(\d+)\./.exec(version);
  return match ? Number(match[1]) : undefined;
}

function normalizeVersion(version: string): string {
  return version.replace(/^v/, "");
}

function within(root: string, path: string): boolean {
  const child = relative(root, path);
  return child !== "" && !child.startsWith("..") && !isAbsolute(child);
}

function sourceKind(path: string, content: string): QualifiedModule["sourceKind"] {
  if (path.endsWith(".d.ts")) {
    return "declaration";
  }
  if (
    /(?:^|\/)(?:generated|vendor|vendored)(?:\/|$)/i.test(path) ||
    /(?:@generated|generated file|do not edit)/i.test(content.slice(0, 1024))
  ) {
    return "generated";
  }
  if (/(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|(?:\.test|\.spec)\.tsx?$/i.test(path)) {
    return "authored_test";
  }
  return "authored_production";
}

function result(
  material: Omit<TypeScriptQualification, "qualificationDigest">,
): TypeScriptQualification {
  return { ...material, qualificationDigest: digestCanonical(material) };
}

export async function qualifyTypeScriptRepository(input: {
  repositoryPath: string;
  repository: RepositoryIdentity;
  commitSha: string;
  toolchain: QualificationToolchain;
}): Promise<TypeScriptQualification> {
  const reasons: string[] = [];
  const base = {
    schemaVersion: "1" as const,
    repository: input.repository,
    commitSha: input.commitSha.toLowerCase(),
    toolchain: input.toolchain,
    commands: {
      install: ["npm", "ci", "--ignore-scripts", "--include=dev", "--no-audit", "--no-fund"],
    },
    modules: [] as QualifiedModule[],
    reasons,
  };
  if (
    input.repository.provider !== "github" ||
    !input.repository.owner.trim() ||
    !input.repository.name.trim() ||
    !/^[a-f0-9]{40}$/i.test(input.commitSha)
  ) {
    reasons.push("invalid_immutable_repository_identity");
    return result({ ...base, status: "invalid" });
  }

  const requestedRoot = resolve(input.repositoryPath);
  try {
    if ((await lstat(requestedRoot)).isSymbolicLink()) {
      reasons.push("repository_root_is_symbolic_link");
      return result({ ...base, status: "blocked" });
    }
  } catch {
    reasons.push("repository_root_inaccessible");
    return result({ ...base, status: "blocked" });
  }
  const root = await realpath(requestedRoot);

  let packageBytes: Buffer;
  let lockBytes: Buffer;
  let tsconfigBytes: Buffer;
  let manifest: PackageManifest;
  let lock: {
    name?: unknown;
    version?: unknown;
    lockfileVersion?: unknown;
    packages?: Record<string, { version?: unknown }>;
  };
  try {
    [packageBytes, lockBytes, tsconfigBytes] = await Promise.all([
      readFile(join(root, "package.json")),
      readFile(join(root, "package-lock.json")),
      readFile(join(root, "tsconfig.json")),
    ]);
    manifest = JSON.parse(packageBytes.toString("utf8")) as PackageManifest;
    lock = JSON.parse(lockBytes.toString("utf8")) as typeof lock;
  } catch {
    reasons.push("missing_or_malformed_required_configuration");
    return result({ ...base, status: "invalid" });
  }

  const rootEntries = new Set(await readdir(root));
  if (rootEntries.has("pnpm-lock.yaml") || rootEntries.has("yarn.lock")) {
    reasons.push("conflicting_or_unsupported_package_manager");
  }
  if (manifest.workspaces !== undefined) {
    reasons.push("workspaces_are_outside_phase_1");
  }
  if (
    typeof manifest.packageManager === "string" &&
    !manifest.packageManager.toLowerCase().startsWith("npm@")
  ) {
    reasons.push("declared_package_manager_is_not_npm");
  }
  const packageName = typeof manifest.name === "string" && manifest.name.trim()
    ? manifest.name
    : undefined;
  const packageVersion = typeof manifest.version === "string" && manifest.version.trim()
    ? manifest.version
    : undefined;
  if (!packageName || !packageVersion) {
    reasons.push("package_identity_is_incomplete");
  }
  if (
    lock.lockfileVersion !== 3 ||
    (typeof lock.name === "string" && packageName !== lock.name) ||
    (typeof lock.version === "string" && packageVersion !== lock.version)
  ) {
    reasons.push("package_lock_identity_mismatch");
  }

  if (
    input.toolchain.node.source !== "approved_runner" ||
    major(input.toolchain.node.version) !== 22 ||
    input.toolchain.node.executable !== "/usr/local/bin/node"
  ) {
    reasons.push("unsupported_or_untrusted_node_runtime");
  }
  const npmMajor = major(input.toolchain.npm.version);
  if (
    input.toolchain.npm.source !== "approved_runner" ||
    npmMajor === undefined ||
    npmMajor < 10 ||
    npmMajor > 11 ||
    input.toolchain.npm.executable !== "/usr/local/bin/npm"
  ) {
    reasons.push("unsupported_or_untrusted_npm_runtime");
  }
  const declaredTypeScript = manifest.devDependencies?.typescript;
  const lockedTypeScript = lock.packages?.["node_modules/typescript"]?.version;
  if (
    input.toolchain.typescript.source !== "project_local" ||
    input.toolchain.typescript.executable !== "/workspace/node_modules/.bin/tsc" ||
    typeof declaredTypeScript !== "string" ||
    typeof lockedTypeScript !== "string" ||
    normalizeVersion(input.toolchain.typescript.version) !== normalizeVersion(lockedTypeScript)
  ) {
    reasons.push("project_local_typescript_identity_mismatch");
  }

  const configPath = join(root, "tsconfig.json");
  const configRead = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configRead.error) {
    reasons.push("malformed_typescript_configuration");
  }
  if (Array.isArray((configRead.config as { references?: unknown } | undefined)?.references)) {
    reasons.push("typescript_project_references_are_outside_phase_1");
  }
  const parsed = ts.parseJsonConfigFileContent(
    configRead.config ?? {},
    ts.sys,
    root,
    { noEmit: true },
    configPath,
  );
  if (parsed.errors.length > 0) {
    reasons.push("typescript_configuration_has_errors");
  }
  const sourceFiles = parsed.fileNames
    .map((path) => resolve(path))
    .filter((path) => within(root, path) && /\.tsx?$/.test(path))
    .sort();
  if (!sourceFiles.some((path) => path.endsWith(".ts") && !path.endsWith(".d.ts"))) {
    reasons.push("no_supported_typescript_source");
  }

  const scripts = manifest.scripts ?? {};
  const typecheck = typeof scripts.typecheck === "string"
    ? "npm run typecheck"
    : "/workspace/node_modules/.bin/tsc --noEmit -p tsconfig.json";
  const build = typeof scripts.build === "string" ? "npm run build" : undefined;
  const test = typeof scripts.test === "string" &&
      !scripts.test.toLowerCase().includes("no test specified")
    ? "npm test"
    : undefined;
  if (!build) {
    reasons.push("required_build_gate_unavailable");
  }
  if (!test) {
    reasons.push("required_test_gate_unavailable");
  }

  const packageIdentity = packageName && packageVersion
    ? digestCanonical({
      repository: input.repository,
      commitSha: input.commitSha.toLowerCase(),
      packageName,
      packageVersion,
      packageJsonSha256: sha256(packageBytes),
      packageLockSha256: sha256(lockBytes),
    })
    : undefined;
  const modules = await Promise.all(sourceFiles.map(async (absolutePath) => {
    const path = portable(relative(root, absolutePath));
    const content = await readFile(absolutePath, "utf8");
    const contentSha256 = sha256(content);
    return {
      moduleId: digestCanonical({
        repository: input.repository,
        commitSha: input.commitSha.toLowerCase(),
        packageIdentity,
        path,
        contentSha256,
      }),
      path,
      contentSha256,
      sourceKind: sourceKind(path, content),
    } satisfies QualifiedModule;
  }));
  const status: QualificationStatus = reasons.length === 0 ? "ready" : "unsupported";
  return result({
    ...base,
    status,
    ...(packageName ? { packageName } : {}),
    ...(packageVersion ? { packageVersion } : {}),
    ...(packageIdentity ? { packageIdentity } : {}),
    sourceRoot: ".",
    packageJsonSha256: sha256(packageBytes),
    packageLockSha256: sha256(lockBytes),
    tsconfigSha256: sha256(tsconfigBytes),
    commands: {
      ...base.commands,
      typecheck,
      ...(build ? { build } : {}),
      ...(test ? { test } : {}),
    },
    modules,
  });
}
