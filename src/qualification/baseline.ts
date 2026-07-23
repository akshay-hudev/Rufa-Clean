import type { IsolatedRunnerSession } from "../security/docker-runner";
import { digestCanonical } from "../milestone/canonical";
import type {
  BaselineGateResult,
  QualificationConfiguration,
  StructuredCommandMapping,
} from "./types";

const SOURCE_DIGEST_SCRIPT = `
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root="/workspace",skip=new Set([".git","node_modules",".dca-output","dist","build","coverage"]);
const rows=[];
function walk(dir){for(const name of fs.readdirSync(dir).sort()){if(skip.has(name))continue;
const p=path.join(dir,name),s=fs.lstatSync(p);if(s.isSymbolicLink())throw new Error("symbolic link in baseline source");
if(s.isDirectory())walk(p);else if(s.isFile())rows.push(path.relative(root,p).split(path.sep).join("/")+"\\0"+crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"));}}
walk(root);process.stdout.write(crypto.createHash("sha256").update(rows.join("\\n")).digest("hex"));
`.trim();

function result(
  material: Omit<BaselineGateResult, "resultDigest">,
): BaselineGateResult {
  return { ...material, resultDigest: digestCanonical(material) };
}

function failedGate(
  gateId: BaselineGateResult["gateId"],
  status: BaselineGateResult["status"],
  failureCategory: string,
  cleanupStatus: BaselineGateResult["cleanupStatus"] = "removed",
): BaselineGateResult {
  return result({
    gateId,
    commandId: `qualification.${gateId}.v1`,
    status,
    failureCategory,
    outputTruncated: false,
    sourceModified: false,
    cleanupStatus,
  });
}

export async function runQualificationBaseline(input: {
  session: IsolatedRunnerSession;
  configuration: QualificationConfiguration;
  commandMappings: readonly StructuredCommandMapping[];
}): Promise<BaselineGateResult[]> {
  const required = new Set(input.configuration.requiredGates);
  const optional = new Set(input.configuration.optionalGates);
  const gates = [...new Set([...required, ...optional])];
  const results: BaselineGateResult[] = [];
  let disposed = false;
  try {
    const install = await input.session.runInstall("npm", [
      "ci",
      "--ignore-scripts",
      "--include=dev",
      "--no-audit",
      "--no-fund",
    ]);
    await input.session.sealNetwork();
    if (install.timedOut || install.exitCode !== 0) {
      const status = install.timedOut ? "timed_out" : "unavailable";
      return gates.map((gate) => failedGate(gate, status, "dependency_install_failed"));
    }
    const before = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
    if (before.timedOut || before.exitCode !== 0 || !/^[a-f0-9]{64}$/.test(before.stdout.trim())) {
      return gates.map((gate) => failedGate(gate, "malformed", "source_digest_before_failed"));
    }
    const sourceDigest = before.stdout.trim();
    for (const gateId of gates) {
      const mapping = input.commandMappings.find(
        (candidate) => candidate.commandId === `qualification.${gateId}.v1`,
      );
      if (!mapping) {
        results.push(failedGate(gateId, "unavailable", "approved_command_mapping_missing"));
        continue;
      }
      const command = await input.session.run(mapping.executable, mapping.args);
      const after = await input.session.run("node", ["-e", SOURCE_DIGEST_SCRIPT]);
      const sourceModified = after.exitCode !== 0 || after.stdout.trim() !== sourceDigest;
      const status: BaselineGateResult["status"] = sourceModified
        ? "security_blocked"
        : command.timedOut
          ? "timed_out"
          : command.exitCode === 0
            ? "passed"
            : "failed";
      results.push(result({
        gateId,
        commandId: mapping.commandId,
        status,
        ...(command.exitCode !== null ? { exitCode: command.exitCode } : {}),
        ...(status !== "passed"
          ? {
            failureCategory: sourceModified
              ? "baseline_modified_source"
              : command.timedOut
                ? "timeout"
                : "nonzero_exit",
          }
          : {}),
        outputTruncated:
          Buffer.byteLength(command.stdout) >= 256 * 1024 ||
          Buffer.byteLength(command.stderr) >= 256 * 1024,
        sourceModified,
        cleanupStatus: "removed",
      }));
    }
    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown baseline infrastructure failure";
    return gates.map((gate) => failedGate(gate, "unavailable", `baseline_infrastructure:${message}`));
  } finally {
    try {
      await input.session.dispose();
      disposed = true;
    } finally {
      if (!disposed) {
        for (const gate of results) {
          gate.cleanupStatus = "cleanup_failed";
        }
      }
    }
  }
}

