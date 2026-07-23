export const PHASE_2_CAPABILITY_IDS = [
  "repository.identity.validate.v1",
  "repository.revision.resolve.v1",
  "repository.profile.qualify.v1",
  "repository.language.detect.v1",
  "repository.package-manager.detect.v1",
  "repository.workspace.detect.v1",
  "repository.source-roots.discover.v1",
  "repository.test-roots.discover.v1",
  "repository.generated-roots.discover.v1",
  "repository.build-system.detect.v1",
  "repository.toolchain.requirements.v1",
  "repository.commands.discover.v1",
  "repository.configuration.validate.v1",
  "repository.baseline.evaluate.v1",
  "repository.capability-route.v1",
] as const;

export type Phase2CapabilityId = (typeof PHASE_2_CAPABILITY_IDS)[number];

export type QualificationStatus =
  | "ready"
  | "ready_with_limited_gates"
  | "configuration_required"
  | "baseline_broken"
  | "unsupported"
  | "inaccessible"
  | "failed"
  | "stale"
  | "security_blocked"
  | "authorization_rejected";

export interface CanonicalRepositoryIdentity {
  provider: "github";
  owner: string;
  name: string;
  fullName: string;
  providerRepositoryId?: string;
}

export interface QualificationRequest {
  schemaVersion: "1";
  requestId: string;
  accountScopeId: string;
  authorizationId: string;
  repository: CanonicalRepositoryIdentity;
  requestedRevision: string;
  resolvedCommit: string;
  sourceSnapshotId: string;
  requestedCapabilities: Phase2CapabilityId[];
  requestedProfileId: "typescript-single-package-npm-v1";
  requestedAt: string;
  requestDigest: string;
}

export type ConfigurationAuthority =
  | "repository"
  | "detected"
  | "trusted_operator"
  | "repository_profile"
  | "tenant_policy"
  | "phase_authorization"
  | "permanent_policy";

export interface QualificationConfiguration {
  schemaVersion: "1";
  sourceRoots: string[];
  testRoots: string[];
  generatedRoots: string[];
  excludedRoots: string[];
  requiredGates: Array<"typecheck" | "build" | "test">;
  optionalGates: Array<"typecheck" | "build" | "test">;
  networkProfile: "network-disabled" | "npm-public-install-only";
  runnerProfile: "isolated-typescript-runner";
}

export interface ConfigurationSource {
  authority: ConfigurationAuthority;
  value: Record<string, unknown>;
}

export interface ConfigurationValidation {
  status: "valid" | "incomplete" | "invalid" | "security_blocked";
  configuration?: QualificationConfiguration;
  sourceAuthorities: ConfigurationAuthority[];
  errors: string[];
  warnings: string[];
  configurationDigest?: string;
}

export interface DetectedLanguage {
  language: "typescript" | "tsx" | "javascript" | "python" | "declaration" | "unknown";
  fileCount: number;
  generatedCount: number;
  testOnly: boolean;
  support: "supported" | "detected_not_supported" | "not_applicable";
}

export interface PackageManagerDetection {
  manager?: "npm" | "pnpm" | "yarn";
  declared?: string;
  lockfiles: string[];
  lockfileVersion?: number;
  conflicts: string[];
  support: "supported" | "unsupported" | "ambiguous" | "missing";
}

export interface WorkspaceDetection {
  detected: boolean;
  mechanisms: string[];
  roots: string[];
  packageCount: number;
  support: "single_package_supported" | "detected_not_supported" | "ambiguous";
}

export interface RootDetection {
  path: string;
  kind: "source" | "test" | "generated" | "excluded";
  discoveryMethod: "trusted_configuration" | "typescript_configuration" | "convention";
  exists: boolean;
  symlinkStatus: "not_symlink" | "safe_internal" | "escape" | "cycle";
  required: boolean;
}

export interface ToolRequirement {
  tool: "node" | "npm" | "typescript";
  requiredRange: string;
  resolvedVersion?: string;
  executable?: string;
  source: "approved_runner" | "project_local";
  status:
    | "available"
    | "available_with_version_mismatch"
    | "missing"
    | "unsupported_version"
    | "ambiguous"
    | "security_blocked"
    | "unverified";
}

export interface CommandObservation {
  source: "package_script" | "typescript_configuration";
  rawName: string;
  likelyPurpose: "install" | "typecheck" | "build" | "test";
  observationDigest: string;
  trustStatus: "untrusted";
  mappingStatus: "mapped" | "unmapped";
}

export interface StructuredCommandMapping {
  commandId: string;
  version: "1";
  executable: string;
  args: string[];
  workingDirectory: "/workspace";
  environmentAllowlist: string[];
  runnerProfile: "isolated-typescript-runner";
  networkProfile: "network-disabled" | "npm-public-install-only";
  timeoutSeconds: number;
  memoryMb: number;
  cpuCount: number;
  processLimit: number;
  outputLimitBytes: number;
}

export interface BaselineGateResult {
  gateId: "typecheck" | "build" | "test";
  commandId: string;
  status:
    | "passed"
    | "failed"
    | "unavailable"
    | "timed_out"
    | "resource_exceeded"
    | "security_blocked"
    | "malformed";
  exitCode?: number;
  failureCategory?: string;
  outputTruncated: boolean;
  sourceModified: boolean;
  cleanupStatus: "removed" | "retained_by_design" | "cleanup_failed";
  resultDigest: string;
}

export type CapabilityRouteStatus =
  | "enabled"
  | "enabled_with_limits"
  | "configuration_required"
  | "blocked_by_baseline"
  | "blocked_by_security"
  | "unsupported"
  | "unavailable"
  | "stale";

export interface CapabilityRoute {
  capabilityId: Phase2CapabilityId;
  status: CapabilityRouteStatus;
  reasons: string[];
}

export interface QualificationResult {
  schemaVersion: "1";
  requestId: string;
  requestDigest: string;
  repository: CanonicalRepositoryIdentity;
  resolvedCommit: string;
  sourceSnapshotId: string;
  profile: {
    id: "typescript-single-package-npm-v1";
    version: "1";
    status: "matched" | "not_matched" | "ambiguous";
    reasons: string[];
  };
  languages: DetectedLanguage[];
  packageManager: PackageManagerDetection;
  workspace: WorkspaceDetection;
  roots: RootDetection[];
  tools: ToolRequirement[];
  commandObservations: CommandObservation[];
  commandMappings: StructuredCommandMapping[];
  configuration: ConfigurationValidation;
  baseline: BaselineGateResult[];
  capabilityRoutes: CapabilityRoute[];
  blockers: string[];
  warnings: string[];
  status: QualificationStatus;
  qualificationDigest: string;
}
