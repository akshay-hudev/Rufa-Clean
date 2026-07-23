import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import { digestCanonical, sha256 } from "../milestone/canonical";
import { validateQualificationConfiguration } from "./config";
import {
  PHASE_2_CAPABILITY_IDS,
  type BaselineGateResult,
  type CanonicalRepositoryIdentity,
  type CapabilityRoute,
  type CommandObservation,
  type ConfigurationSource,
  type DetectedLanguage,
  type PackageManagerDetection,
  type Phase2CapabilityId,
  type QualificationRequest,
  type QualificationResult,
  type QualificationStatus,
  type RootDetection,
  type StructuredCommandMapping,
  type ToolRequirement,
  type WorkspaceDetection,
} from "./types";

const COMMIT = /^[a-f0-9]{40}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{2,159}$/i;

function portable(value: string): string {
  return value.split(sep).join("/");
}

function within(root: string, candidate: string): boolean {
  const child = relative(root, candidate);
  return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}

export function canonicalRepositoryIdentity(input: {
  provider: string;
  owner: string;
  name: string;
  fullName?: string;
  providerRepositoryId?: string;
}): CanonicalRepositoryIdentity {
  const provider = input.provider.trim().toLowerCase();
  const owner = input.owner.trim();
  const name = input.name.trim();
  if (provider !== "github" || !owner || !name || owner.includes("/") || name.includes("/")) {
    throw new Error("invalid_canonical_repository_identity");
  }
  const fullName = `${owner}/${name}`;
  if (input.fullName && input.fullName.toLowerCase() !== fullName.toLowerCase()) {
    throw new Error("canonical_repository_full_name_mismatch");
  }
  return {
    provider: "github",
    owner,
    name,
    fullName,
    ...(input.providerRepositoryId ? { providerRepositoryId: input.providerRepositoryId } : {}),
  };
}

export function createQualificationRequest(input: Omit<QualificationRequest, "requestDigest">): QualificationRequest {
  const repository = canonicalRepositoryIdentity(input.repository);
  if (
    !ID.test(input.requestId) ||
    !input.accountScopeId.trim() ||
    !input.authorizationId.trim() ||
    !input.requestedRevision.trim() ||
    !COMMIT.test(input.resolvedCommit) ||
    !/^[a-f0-9]{64}$/.test(input.sourceSnapshotId) ||
    Number.isNaN(Date.parse(input.requestedAt))
  ) {
    throw new Error("invalid_qualification_request");
  }
  const requestedCapabilities = [...new Set(input.requestedCapabilities)].sort() as Phase2CapabilityId[];
  if (
    requestedCapabilities.length === 0 ||
    requestedCapabilities.some((capability) => !PHASE_2_CAPABILITY_IDS.includes(capability))
  ) {
    throw new Error("invalid_requested_capabilities");
  }
  const material = {
    ...input,
    repository,
    resolvedCommit: input.resolvedCommit.toLowerCase(),
    requestedCapabilities,
  };
  return { ...material, requestDigest: digestCanonical(material) };
}

interface FileEntry {
  path: string;
  generated: boolean;
  test: boolean;
}

async function inventory(root: string): Promise<{ files: FileEntry[]; unsafe: string[] }> {
  const files: FileEntry[] = [];
  const unsafe: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry.name)) continue;
      const absolute = join(directory, entry.name);
      const path = portable(relative(root, absolute));
      const metadata = await lstat(absolute);
      if (metadata.isSymbolicLink()) {
        try {
          const target = await realpath(absolute);
          if (!within(root, target)) unsafe.push(`symlink_escape:${path}`);
          else unsafe.push(`symlink_present:${path}`);
        } catch {
          unsafe.push(`symlink_cycle_or_broken:${path}`);
        }
        continue;
      }
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        files.push({
          path,
          generated: /(?:^|\/)(?:generated|vendor|vendored)(?:\/|$)/i.test(path),
          test: /(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|(?:\.test|\.spec)\.[^.]+$/i.test(path),
        });
      }
    }
  };
  await visit(root);
  return { files, unsafe };
}

function languages(files: readonly FileEntry[]): DetectedLanguage[] {
  const groups = new Map<DetectedLanguage["language"], FileEntry[]>();
  for (const file of files) {
    let language: DetectedLanguage["language"];
    if (file.path.endsWith(".d.ts")) language = "declaration";
    else if (file.path.endsWith(".tsx")) language = "tsx";
    else if (file.path.endsWith(".ts")) language = "typescript";
    else if (file.path.endsWith(".js") || file.path.endsWith(".jsx")) language = "javascript";
    else if (file.path.endsWith(".py")) language = "python";
    else continue;
    groups.set(language, [...(groups.get(language) ?? []), file]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([language, entries]) => ({
      language,
      fileCount: entries.length,
      generatedCount: entries.filter((entry) => entry.generated).length,
      testOnly: entries.every((entry) => entry.test),
      support: ["typescript", "declaration"].includes(language)
        ? "supported"
        : "detected_not_supported",
    }));
}

function packageManager(
  rootFiles: Set<string>,
  manifest: Record<string, unknown>,
  lock: Record<string, unknown> | undefined,
): PackageManagerDetection {
  const lockfiles = ["package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock"]
    .filter((file) => rootFiles.has(file));
  const managers = new Set<string>();
  if (lockfiles.some((file) => file.includes("package-lock") || file === "npm-shrinkwrap.json")) managers.add("npm");
  if (lockfiles.includes("pnpm-lock.yaml")) managers.add("pnpm");
  if (lockfiles.includes("yarn.lock")) managers.add("yarn");
  const declared = typeof manifest.packageManager === "string" ? manifest.packageManager : undefined;
  if (declared) managers.add(declared.split("@")[0]!.toLowerCase());
  const conflicts = managers.size > 1 ? [`conflicting_package_managers:${[...managers].sort().join(",")}`] : [];
  const manager = managers.size === 1 ? [...managers][0] as PackageManagerDetection["manager"] : undefined;
  const lockfileVersion = typeof lock?.lockfileVersion === "number" ? lock.lockfileVersion : undefined;
  return {
    ...(manager ? { manager } : {}),
    ...(declared ? { declared } : {}),
    lockfiles,
    ...(lockfileVersion !== undefined ? { lockfileVersion } : {}),
    conflicts,
    support: conflicts.length
      ? "ambiguous"
      : manager === "npm" && lockfileVersion === 3
        ? "supported"
        : manager
          ? "unsupported"
          : "missing",
  };
}

function workspace(
  rootFiles: Set<string>,
  manifest: Record<string, unknown>,
  files: readonly FileEntry[],
): WorkspaceDetection {
  const mechanisms: string[] = [];
  if (manifest.workspaces !== undefined) mechanisms.push("package.json#workspaces");
  if (rootFiles.has("pnpm-workspace.yaml")) mechanisms.push("pnpm-workspace.yaml");
  if (rootFiles.has("lerna.json")) mechanisms.push("lerna.json");
  const packageRoots = files
    .filter((file) => file.path.endsWith("/package.json"))
    .map((file) => file.path.slice(0, -"/package.json".length));
  const detected = mechanisms.length > 0;
  return {
    detected,
    mechanisms,
    roots: [...new Set(packageRoots)].sort(),
    packageCount: packageRoots.length + 1,
    support: detected ? "detected_not_supported" : "single_package_supported",
  };
}

async function roots(
  root: string,
  configuration: ReturnType<typeof validateQualificationConfiguration>,
): Promise<RootDetection[]> {
  if (!configuration.configuration) return [];
  const result: RootDetection[] = [];
  for (const [kind, paths] of [
    ["source", configuration.configuration.sourceRoots],
    ["test", configuration.configuration.testRoots],
    ["generated", configuration.configuration.generatedRoots],
    ["excluded", configuration.configuration.excludedRoots],
  ] as const) {
    for (const path of paths) {
      const absolute = resolve(root, path);
      let exists = false;
      let symlinkStatus: RootDetection["symlinkStatus"] = "not_symlink";
      try {
        const metadata = await lstat(absolute);
        exists = metadata.isDirectory() || metadata.isFile();
        if (metadata.isSymbolicLink()) {
          const target = await realpath(absolute);
          symlinkStatus = within(root, target) ? "safe_internal" : "escape";
        }
      } catch {
        exists = false;
      }
      result.push({
        path,
        kind,
        discoveryMethod: "trusted_configuration",
        exists,
        symlinkStatus,
        required: kind === "source",
      });
    }
  }
  return result.sort((left, right) => `${left.kind}:${left.path}`.localeCompare(`${right.kind}:${right.path}`));
}

function observations(manifest: Record<string, unknown>): CommandObservation[] {
  const scripts = manifest.scripts && typeof manifest.scripts === "object"
    ? manifest.scripts as Record<string, unknown>
    : {};
  const purposes = ["typecheck", "build", "test"] as const;
  return purposes
    .filter((purpose) => typeof scripts[purpose] === "string")
    .map((purpose) => ({
      source: "package_script" as const,
      rawName: purpose,
      likelyPurpose: purpose,
      observationDigest: sha256(String(scripts[purpose])),
      trustStatus: "untrusted" as const,
      mappingStatus: "mapped" as const,
    }));
}

function mappings(
  observed: readonly CommandObservation[],
  configuration: ReturnType<typeof validateQualificationConfiguration>,
): StructuredCommandMapping[] {
  if (!configuration.configuration) return [];
  const available = new Set(observed.map((item) => item.likelyPurpose));
  const common = {
    version: "1" as const,
    workingDirectory: "/workspace" as const,
    environmentAllowlist: ["CI", "HOME", "PATH", "TMPDIR"],
    runnerProfile: "isolated-typescript-runner" as const,
    networkProfile: "network-disabled" as const,
    timeoutSeconds: 600,
    memoryMb: 1024,
    cpuCount: 1,
    processLimit: 128,
    outputLimitBytes: 2_097_152,
  };
  const result: StructuredCommandMapping[] = [{
    ...common,
    commandId: "qualification.typecheck.v1",
    executable: "/workspace/node_modules/.bin/tsc",
    args: ["--noEmit", "-p", "tsconfig.json"],
  }];
  for (const purpose of ["build", "test"] as const) {
    if (!available.has(purpose)) continue;
    result.push({
      ...common,
      commandId: `qualification.${purpose}.v1`,
      executable: "/usr/local/bin/npm",
      args: purpose === "build" ? ["run", "build"] : ["test"],
    });
  }
  return result;
}

function routes(
  request: QualificationRequest,
  status: QualificationStatus,
  blockers: readonly string[],
): CapabilityRoute[] {
  const detected = new Set<Phase2CapabilityId>([
    "repository.identity.validate.v1",
    "repository.revision.resolve.v1",
    "repository.language.detect.v1",
    "repository.package-manager.detect.v1",
    "repository.workspace.detect.v1",
    "repository.source-roots.discover.v1",
    "repository.test-roots.discover.v1",
    "repository.generated-roots.discover.v1",
    "repository.build-system.detect.v1",
    "repository.toolchain.requirements.v1",
    "repository.commands.discover.v1",
  ]);
  return request.requestedCapabilities.map((capabilityId) => ({
    capabilityId,
    status:
      status === "ready"
        ? "enabled"
        : status === "ready_with_limited_gates"
          ? "enabled_with_limits"
          : status === "stale"
            ? "stale"
            : status === "security_blocked" || status === "authorization_rejected"
              ? "blocked_by_security"
              : status === "inaccessible" || status === "failed"
                ? capabilityId === "repository.identity.validate.v1"
                  ? "enabled_with_limits"
                  : "unavailable"
                : status === "configuration_required"
                  ? detected.has(capabilityId)
                    ? "enabled_with_limits"
                    : "configuration_required"
                  : status === "unsupported"
                    ? detected.has(capabilityId)
                      ? "enabled_with_limits"
                      : "unsupported"
                    : capabilityId === "repository.baseline.evaluate.v1"
                      ? "blocked_by_baseline"
                      : "enabled_with_limits",
    reasons: [...blockers],
  }));
}

function finalResult(
  material: Omit<QualificationResult, "qualificationDigest">,
): QualificationResult {
  return { ...material, qualificationDigest: digestCanonical(material) };
}

export async function qualifyRepository(input: {
  repositoryPath: string;
  request: QualificationRequest;
  authorizationActive: boolean;
  targetAccessAllowed: boolean;
  configurationSources: readonly ConfigurationSource[];
  tools: readonly ToolRequirement[];
  baseline: readonly BaselineGateResult[];
}): Promise<QualificationResult> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const configuration = validateQualificationConfiguration(input.configurationSources);
  const empty = {
    schemaVersion: "1" as const,
    requestId: input.request.requestId,
    requestDigest: input.request.requestDigest,
    repository: input.request.repository,
    resolvedCommit: input.request.resolvedCommit,
    sourceSnapshotId: input.request.sourceSnapshotId,
    profile: {
      id: "typescript-single-package-npm-v1" as const,
      version: "1" as const,
      status: "not_matched" as const,
      reasons: [] as string[],
    },
    languages: [] as DetectedLanguage[],
    packageManager: { lockfiles: [], conflicts: [], support: "missing" as const },
    workspace: {
      detected: false, mechanisms: [], roots: [], packageCount: 0,
      support: "ambiguous" as const,
    },
    roots: [] as RootDetection[],
    tools: [...input.tools],
    commandObservations: [] as CommandObservation[],
    commandMappings: [] as StructuredCommandMapping[],
    configuration,
    baseline: [...input.baseline],
    capabilityRoutes: [] as CapabilityRoute[],
    blockers,
    warnings,
  };
  if (!input.authorizationActive || !input.targetAccessAllowed) {
    blockers.push(!input.authorizationActive ? "authorization_inactive" : "repository_target_access_denied");
    const status = "authorization_rejected";
    return finalResult({ ...empty, status, capabilityRoutes: routes(input.request, status, blockers) });
  }
  if (
    input.request.repository.fullName.toLowerCase() === "akshay-hudev/rufa-clean"
  ) {
    blockers.push("permanent_repository_role_exclusion");
    const status = "authorization_rejected";
    return finalResult({ ...empty, status, capabilityRoutes: routes(input.request, status, blockers) });
  }

  let root: string;
  try {
    const requested = resolve(input.repositoryPath);
    if ((await lstat(requested)).isSymbolicLink()) {
      blockers.push("repository_root_is_symbolic_link");
      const status = "security_blocked";
      return finalResult({ ...empty, status, capabilityRoutes: routes(input.request, status, blockers) });
    }
    root = await realpath(requested);
    if (!(await stat(root)).isDirectory()) throw new Error("not directory");
  } catch {
    blockers.push("repository_source_inaccessible");
    const status = "inaccessible";
    return finalResult({ ...empty, status, capabilityRoutes: routes(input.request, status, blockers) });
  }

  let manifest: Record<string, unknown>;
  let lock: Record<string, unknown> | undefined;
  let rootFiles: Set<string>;
  try {
    rootFiles = new Set(await readdir(root));
    manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as Record<string, unknown>;
    if (rootFiles.has("package-lock.json")) {
      lock = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8")) as Record<string, unknown>;
    }
  } catch {
    blockers.push("missing_or_malformed_package_configuration");
    const status = "configuration_required";
    return finalResult({ ...empty, status, capabilityRoutes: routes(input.request, status, blockers) });
  }
  const inventoryResult = await inventory(root);
  if (inventoryResult.unsafe.some((item) => item.startsWith("symlink_escape") || item.startsWith("symlink_cycle"))) {
    blockers.push(...inventoryResult.unsafe);
  } else {
    warnings.push(...inventoryResult.unsafe);
  }
  const detectedLanguages = languages(inventoryResult.files);
  const manager = packageManager(rootFiles, manifest, lock);
  const detectedWorkspace = workspace(rootFiles, manifest, inventoryResult.files);
  const detectedRoots = await roots(root, configuration);
  const commandObservations = observations(manifest);
  const commandMappings = mappings(commandObservations, configuration);
  const profileReasons: string[] = [];
  if (!detectedLanguages.some((language) => language.language === "typescript" && language.fileCount > language.generatedCount)) {
    profileReasons.push("no_authored_typescript_source");
  }
  if (manager.support !== "supported") profileReasons.push(`package_manager_${manager.support}`);
  if (detectedWorkspace.detected) profileReasons.push("workspace_profile_not_supported");
  if (!rootFiles.has("tsconfig.json")) profileReasons.push("root_typescript_configuration_missing");
  if (configuration.status !== "valid") profileReasons.push(`configuration_${configuration.status}`);
  if (detectedRoots.some((entry) => entry.required && (!entry.exists || entry.symlinkStatus === "escape"))) {
    profileReasons.push("required_source_root_invalid");
  }
  const requiredTools = input.tools.filter((tool) => ["node", "npm", "typescript"].includes(tool.tool));
  if (requiredTools.length !== 3 || requiredTools.some((tool) => tool.status !== "available")) {
    profileReasons.push("required_toolchain_unavailable");
  }
  const requiredGates = new Set(configuration.configuration?.requiredGates ?? []);
  const missingMappings = [...requiredGates].filter(
    (gate) => !commandMappings.some((mapping) => mapping.commandId === `qualification.${gate}.v1`),
  );
  if (missingMappings.length) profileReasons.push(`required_command_mapping_missing:${missingMappings.join(",")}`);

  let status: QualificationStatus;
  if (blockers.length) {
    status = "security_blocked";
  } else if (configuration.status === "security_blocked") {
    blockers.push(...configuration.errors);
    status = "security_blocked";
  } else if (configuration.status !== "valid" || missingMappings.length) {
    blockers.push(...configuration.errors, ...missingMappings.map((gate) => `missing_mapping:${gate}`));
    status = "configuration_required";
  } else if (profileReasons.length) {
    blockers.push(...profileReasons);
    status = "unsupported";
  } else {
    const requiredResults = input.baseline.filter((result) => requiredGates.has(result.gateId));
    if (requiredResults.length !== requiredGates.size) {
      blockers.push("required_baseline_results_missing");
      status = "configuration_required";
    } else if (requiredResults.some((result) =>
      result.status !== "passed" || result.sourceModified || result.cleanupStatus === "cleanup_failed"
    )) {
      blockers.push("required_baseline_gate_failed");
      status = requiredResults.some((result) => result.status === "security_blocked" || result.sourceModified)
        ? "security_blocked"
        : "baseline_broken";
    } else if (input.baseline.some((result) => result.status !== "passed")) {
      warnings.push("optional_baseline_gate_unavailable");
      status = "ready_with_limited_gates";
    } else {
      status = "ready";
    }
  }
  const profileStatus = profileReasons.length ? "not_matched" : "matched";
  return finalResult({
    ...empty,
    profile: { ...empty.profile, status: profileStatus, reasons: profileReasons },
    languages: detectedLanguages,
    packageManager: manager,
    workspace: detectedWorkspace,
    roots: detectedRoots,
    commandObservations,
    commandMappings,
    blockers,
    warnings,
    status,
    capabilityRoutes: routes(input.request, status, blockers),
  });
}

export function qualificationIsFresh(
  result: QualificationResult,
  input: {
    requestDigest: string;
    sourceSnapshotId: string;
    configurationDigest: string | undefined;
    runnerProfile: string | undefined;
  },
): boolean {
  return (
    result.requestDigest === input.requestDigest &&
    result.sourceSnapshotId === input.sourceSnapshotId &&
    result.configuration.configurationDigest === input.configurationDigest &&
    result.configuration.configuration?.runnerProfile === input.runnerProfile
  );
}

export function markQualificationStale(
  result: QualificationResult,
  reasons: readonly string[],
): QualificationResult {
  const blockers = [...new Set([...result.blockers, ...reasons])].sort();
  const material: Omit<QualificationResult, "qualificationDigest"> = {
    ...result,
    status: "stale",
    blockers,
    capabilityRoutes: routes(
      {
        schemaVersion: "1",
        requestId: result.requestId,
        accountScopeId: "retained",
        authorizationId: "retained",
        repository: result.repository,
        requestedRevision: result.resolvedCommit,
        resolvedCommit: result.resolvedCommit,
        sourceSnapshotId: result.sourceSnapshotId,
        requestedCapabilities: result.capabilityRoutes.map((route) => route.capabilityId),
        requestedProfileId: result.profile.id,
        requestedAt: "1970-01-01T00:00:00.000Z",
        requestDigest: result.requestDigest,
      },
      "stale",
      blockers,
    ),
  };
  delete (material as Partial<QualificationResult>).qualificationDigest;
  return finalResult(material);
}
