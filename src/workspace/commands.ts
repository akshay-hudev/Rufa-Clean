import { digestCanonical } from "../milestone/canonical";
import type { StructuredCommandMapping } from "../qualification/types";
import type { WorkspacePackage } from "./types";

export interface WorkspacePackageCommandMapping extends StructuredCommandMapping {
  packageIdentityDigest: string;
  packageRoot: string;
  gateId: "typecheck" | "build" | "test";
  aggregate: false;
}

export interface WorkspaceAggregateCommandMapping extends StructuredCommandMapping {
  packageIdentityDigest: "workspace-root";
  packageRoot: ".";
  gateId: "typecheck" | "build" | "test";
  aggregate: true;
}

export type WorkspaceCommandMapping =
  | WorkspacePackageCommandMapping
  | WorkspaceAggregateCommandMapping;

const COMMON = {
  version: "1" as const,
  workingDirectory: "/workspace" as const,
  environmentAllowlist: ["CI", "NODE_ENV"],
  runnerProfile: "isolated-typescript-runner" as const,
  networkProfile: "network-disabled" as const,
  timeoutSeconds: 600,
  memoryMb: 1024,
  cpuCount: 1,
  processLimit: 128,
  outputLimitBytes: 256 * 1024,
};

function packageTypecheck(pkg: WorkspacePackage): WorkspacePackageCommandMapping {
  const project = pkg.tsconfigPaths[0] ?? `${pkg.identity.packageRoot}/tsconfig.json`;
  return {
    ...COMMON,
    commandId: `workspace.package.typecheck.v1:${pkg.identity.packageIdentityDigest}`,
    packageIdentityDigest: pkg.identity.packageIdentityDigest,
    packageRoot: pkg.identity.packageRoot,
    gateId: "typecheck",
    aggregate: false,
    executable: "/workspace/node_modules/.bin/tsc",
    args: ["--noEmit", "-p", project],
  };
}

function packageBuild(pkg: WorkspacePackage): WorkspacePackageCommandMapping {
  return {
    ...COMMON,
    commandId: `workspace.package.build.v1:${pkg.identity.packageIdentityDigest}`,
    packageIdentityDigest: pkg.identity.packageIdentityDigest,
    packageRoot: pkg.identity.packageRoot,
    gateId: "build",
    aggregate: false,
    executable: "/usr/local/bin/npm",
    args: ["run", "build", "-w", pkg.identity.packageName, "--if-present"],
  };
}

function packageTest(pkg: WorkspacePackage): WorkspacePackageCommandMapping {
  return {
    ...COMMON,
    commandId: `workspace.package.test.v1:${pkg.identity.packageIdentityDigest}`,
    packageIdentityDigest: pkg.identity.packageIdentityDigest,
    packageRoot: pkg.identity.packageRoot,
    gateId: "test",
    aggregate: false,
    executable: "/usr/local/bin/npm",
    args: ["test", "-w", pkg.identity.packageName, "--if-present"],
  };
}

export function mapWorkspacePackageCommands(
  packages: readonly WorkspacePackage[],
): WorkspacePackageCommandMapping[] {
  const mappings: WorkspacePackageCommandMapping[] = [];
  for (const pkg of packages) {
    if (pkg.identity.packageRoot === "." || pkg.support === "excluded_irrelevant") {
      continue;
    }
    mappings.push(packageTypecheck(pkg), packageBuild(pkg), packageTest(pkg));
  }
  return mappings.sort((left, right) => left.commandId.localeCompare(right.commandId));
}

export function mapWorkspaceAggregateCommands(): WorkspaceAggregateCommandMapping[] {
  return [
    {
      ...COMMON,
      commandId: "workspace.aggregate.typecheck.v1",
      packageIdentityDigest: "workspace-root",
      packageRoot: ".",
      gateId: "typecheck",
      aggregate: true,
      executable: "/workspace/node_modules/.bin/tsc",
      args: ["--noEmit", "-p", "tsconfig.json"],
    },
    {
      ...COMMON,
      commandId: "workspace.aggregate.build.v1",
      packageIdentityDigest: "workspace-root",
      packageRoot: ".",
      gateId: "build",
      aggregate: true,
      executable: "/usr/local/bin/npm",
      args: ["run", "build", "--workspaces", "--if-present"],
    },
    {
      ...COMMON,
      commandId: "workspace.aggregate.test.v1",
      packageIdentityDigest: "workspace-root",
      packageRoot: ".",
      gateId: "test",
      aggregate: true,
      executable: "/usr/local/bin/npm",
      args: ["test", "--workspaces", "--if-present"],
    },
  ];
}

export function assertCommandIdentityBinding(
  mapping: WorkspaceCommandMapping,
  expectedPackageIdentityDigest: string,
): void {
  if (mapping.packageIdentityDigest !== expectedPackageIdentityDigest) {
    throw new Error(
      `command_identity_mismatch:${mapping.commandId}:${mapping.packageIdentityDigest}`,
    );
  }
}

export function commandRoutingDigest(mappings: readonly WorkspaceCommandMapping[]): string {
  return digestCanonical(
    mappings.map((mapping) => ({
      commandId: mapping.commandId,
      packageIdentityDigest: mapping.packageIdentityDigest,
      packageRoot: mapping.packageRoot,
      gateId: mapping.gateId,
      executable: mapping.executable,
      args: mapping.args,
      aggregate: mapping.aggregate,
    })),
  );
}
