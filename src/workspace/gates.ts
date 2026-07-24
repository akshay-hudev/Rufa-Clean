import type { IsolatedRunnerSession } from "../security/docker-runner";
import { digestCanonical } from "../milestone/canonical";
import type { PackageGateResult } from "./types";
import {
  assertCommandIdentityBinding,
  type WorkspaceCommandMapping,
} from "./commands";

const SOURCE_DIGEST_SCRIPT = `
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root="/workspace",skip=new Set([".git","node_modules",".dca-output","dist","build","coverage"]);
const rows=[];
function walk(dir){for(const name of fs.readdirSync(dir).sort()){if(skip.has(name)||name.endsWith(".tsbuildinfo"))continue;
const p=path.join(dir,name),s=fs.lstatSync(p);if(s.isSymbolicLink())throw new Error("symbolic link in baseline source");
if(s.isDirectory())walk(p);else if(s.isFile())rows.push(path.relative(root,p).split(path.sep).join("/")+"\\0"+crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"));}}
walk(root);process.stdout.write(crypto.createHash("sha256").update(rows.join("\\n")).digest("hex"));
`.trim();

function gateResult(
  material: Omit<PackageGateResult, "resultDigest">,
): PackageGateResult {
  return { ...material, resultDigest: digestCanonical(material) };
}

export async function runWorkspaceBaselineGates(input: {
  session: IsolatedRunnerSession;
  packageMappings: readonly WorkspaceCommandMapping[];
  aggregateMappings: readonly WorkspaceCommandMapping[];
}): Promise<{
  packageGates: PackageGateResult[];
  aggregateGates: PackageGateResult[];
  sourceDigestBefore: string;
  sourceDigestAfter: string;
  installExitCode: number;
}> {
  const install = await input.session.runInstall("npm", [
    "ci",
    "--ignore-scripts",
    "--include=dev",
    "--no-audit",
    "--no-fund",
  ]);
  await input.session.sealNetwork();
  if (install.timedOut || install.exitCode !== 0) {
    const failed = [...input.packageMappings, ...input.aggregateMappings].map((mapping) =>
      gateResult({
        packageIdentityDigest: mapping.packageIdentityDigest,
        gateId: mapping.gateId,
        status: install.timedOut ? "unavailable" : "failed",
      }),
    );
    return {
      packageGates: failed.filter((_, index) => index < input.packageMappings.length),
      aggregateGates: failed.filter((_, index) => index >= input.packageMappings.length),
      sourceDigestBefore: "",
      sourceDigestAfter: "",
      installExitCode: install.exitCode ?? 1,
    };
  }

  const before = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
  if (before.timedOut || before.exitCode !== 0 || !/^[a-f0-9]{64}$/.test(before.stdout.trim())) {
    throw new Error("workspace_source_digest_before_failed");
  }
  const sourceDigestBefore = before.stdout.trim();

  const packageGates: PackageGateResult[] = [];
  for (const mapping of input.packageMappings) {
    assertCommandIdentityBinding(mapping, mapping.packageIdentityDigest);
    const command = await input.session.run(mapping.executable, mapping.args);
    const after = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
    const sourceModified = after.exitCode !== 0 || after.stdout.trim() !== sourceDigestBefore;
    packageGates.push(gateResult({
      packageIdentityDigest: mapping.packageIdentityDigest,
      gateId: mapping.gateId,
      status: sourceModified
        ? "security_blocked"
        : command.timedOut || command.exitCode !== 0
          ? "failed"
          : "passed",
    }));
  }

  const aggregateGates: PackageGateResult[] = [];
  for (const mapping of input.aggregateMappings) {
    assertCommandIdentityBinding(mapping, "workspace-root");
    const command = await input.session.run(mapping.executable, mapping.args);
    const after = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
    const sourceModified = after.exitCode !== 0 || after.stdout.trim() !== sourceDigestBefore;
    const packageFailed = packageGates.some((gate) => gate.status !== "passed");
    aggregateGates.push(gateResult({
      packageIdentityDigest: mapping.packageIdentityDigest,
      gateId: mapping.gateId,
      status: sourceModified
        ? "security_blocked"
        : packageFailed
          ? "failed"
          : command.timedOut || command.exitCode !== 0
            ? "failed"
            : "passed",
    }));
  }

  const afterAll = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
  return {
    packageGates,
    aggregateGates,
    sourceDigestBefore,
    sourceDigestAfter: afterAll.stdout.trim(),
    installExitCode: install.exitCode ?? 1,
  };
}

export function aggregateCannotHidePackageFailure(
  packageGates: readonly PackageGateResult[],
  aggregateGates: readonly PackageGateResult[],
): boolean {
  const packageFailed = packageGates.some((gate) => gate.status !== "passed");
  if (!packageFailed) return true;
  return aggregateGates.every((gate) => gate.status !== "passed");
}
