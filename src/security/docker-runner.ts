import { randomBytes } from "node:crypto";
import { access, lstat, realpath } from "node:fs/promises";

import { runProcess } from "../remediation/process";
import type { ProcessResult } from "../remediation/types";
import { allowlistedEnvironment, ISOLATED_REPOSITORY_ENVIRONMENT } from "./environment";

const DIGEST_PINNED_IMAGE = /@sha256:[a-f0-9]{64}$/;

export interface IsolatedRunnerLimits {
  cpus: number;
  memoryMb: number;
  diskMb: number;
  pids: number;
  timeoutMs: number;
  outputBytes: number;
}

export const DEFAULT_ISOLATED_LIMITS: Readonly<IsolatedRunnerLimits> = Object.freeze({
  cpus: 1,
  memoryMb: 1024,
  diskMb: 2048,
  pids: 128,
  timeoutMs: 15 * 60_000,
  outputBytes: 256 * 1024,
});

type ProcessRunner = typeof runProcess;

export interface IsolatedCommandResult extends ProcessResult {
  networkMode: "registry_proxy" | "none";
}

export interface RegistryEgress {
  /** Docker `--internal` network containing only an allowlisting registry proxy. */
  networkName: string;
  proxyUrl: string;
}

export interface IsolatedRunnerSession {
  readonly containerName: string;
  runInstall(command: string, args: string[]): Promise<IsolatedCommandResult>;
  sealNetwork(): Promise<void>;
  run(command: string, args: string[]): Promise<IsolatedCommandResult>;
  readTextArtifact(containerPath: string): Promise<string>;
  copyOut(containerPath: string, destinationPath: string): Promise<void>;
  dispose(): Promise<void>;
}

function requirePinnedImage(image: string): void {
  if (!DIGEST_PINNED_IMAGE.test(image)) {
    throw new Error("DCA_RUNNER_IMAGE must be pinned by sha256 digest");
  }
}

function requireSafeAbsolutePath(path: string): void {
  if (!path.startsWith("/") || path === "/") {
    throw new Error(`Isolated runner source must be a specific absolute path: ${path}`);
  }
}

function requireCommandToken(value: string, label: string): void {
  if (!value || value.includes("\0")) {
    throw new Error(`Invalid ${label}`);
  }
}

export class DockerIsolatedRunner {
  constructor(
    private readonly image: string,
    private readonly limits: IsolatedRunnerLimits = DEFAULT_ISOLATED_LIMITS,
    private readonly processRunner: ProcessRunner = runProcess,
    private readonly registryEgress?: RegistryEgress,
  ) {
    requirePinnedImage(image);
  }

  async createSession(sourcePath: string): Promise<IsolatedRunnerSession> {
    requireSafeAbsolutePath(sourcePath);
    await access(sourcePath);
    if ((await lstat(sourcePath)).isSymbolicLink()) {
      throw new Error("Isolated runner source path must not be a symbolic link");
    }
    const canonicalSource = await realpath(sourcePath);
    const containerName = `dcav2-${randomBytes(10).toString("hex")}`;
    const dockerRaw = async (args: string[], timeoutMs = this.limits.timeoutMs): Promise<ProcessResult> => {
      const result = await this.processRunner("docker", args, {
        cwd: canonicalSource,
        env: allowlistedEnvironment({ DOCKER_BUILDKIT: "1" }),
        timeoutMs,
        outputLimitBytes: this.limits.outputBytes,
      });
      return result;
    };
    const docker = async (args: string[], timeoutMs = this.limits.timeoutMs): Promise<ProcessResult> => {
      const result = await dockerRaw(args, timeoutMs);
      if (result.exitCode !== 0 || result.timedOut) {
        throw new Error(
          `Docker isolation command failed: docker ${args[0] ?? ""}: ` +
            (result.stderr.trim() || result.stdout.trim() || result.signal || "unknown failure"),
        );
      }
      return result;
    };

    if (this.registryEgress) {
      const network = await docker([
        "network", "inspect", "--format", "{{.Internal}}", this.registryEgress.networkName,
      ], 30_000);
      if (network.stdout.trim() !== "true") {
        throw new Error("DCA registry network must be a Docker internal network");
      }
    }

    const createArgs = [
      "create",
      "--name", containerName,
      "--network", this.registryEgress?.networkName ?? "none",
      "--read-only",
      "--user", "65532:65532",
      "--cap-drop", "ALL",
      "--security-opt", "no-new-privileges",
      "--pids-limit", String(this.limits.pids),
      "--memory", `${this.limits.memoryMb}m`,
      "--memory-swap", `${this.limits.memoryMb}m`,
      "--cpus", String(this.limits.cpus),
      "--tmpfs", `/workspace:rw,exec,nosuid,nodev,size=${this.limits.diskMb}m,mode=1777`,
      "--tmpfs", "/tmp:rw,exec,nosuid,nodev,size=256m,mode=1777",
      "--mount", `type=bind,source=${canonicalSource},target=/input,readonly`,
    ];
    for (const [key, value] of Object.entries(ISOLATED_REPOSITORY_ENVIRONMENT)) {
      createArgs.push("--env", `${key}=${value}`);
    }
    createArgs.push(this.image, "sleep", "infinity");

    let created = false;
    let disposed = false;
    let networkSealed = false;
    try {
      await docker(createArgs, 60_000);
      created = true;
      await docker(["start", containerName], 60_000);
      await docker([
        "exec", containerName, "sh", "-c",
        "mkdir -p /tmp/dca-home && cp -R /input/. /workspace/ && rm -rf /workspace/.git",
      ], 60_000);
    } catch (error) {
      if (created) {
        await this.processRunner("docker", ["rm", "-f", containerName], {
          cwd: canonicalSource,
          env: allowlistedEnvironment(),
          timeoutMs: 60_000,
          outputLimitBytes: this.limits.outputBytes,
        });
      }
      throw error;
    }

    const exec = async (
      command: string,
      args: string[],
      networkMode: "registry_proxy" | "none",
      executionEnvironment: Readonly<Record<string, string>> = {},
    ): Promise<IsolatedCommandResult> => {
      if (disposed) {
        throw new Error("Isolated runner session has been disposed");
      }
      requireCommandToken(command, "command");
      args.forEach((arg) => requireCommandToken(arg, "command argument"));
      const dockerArgs = ["exec", "--workdir", "/workspace"];
      for (const [key, value] of Object.entries(executionEnvironment)) {
        dockerArgs.push("--env", `${key}=${value}`);
      }
      dockerArgs.push(containerName, command, ...args);
      const result = await dockerRaw(dockerArgs);
      if (result.timedOut) {
        await dockerRaw(["kill", containerName], 30_000);
      }
      return { ...result, command, args, cwd: "/workspace", networkMode };
    };

    return {
      containerName,
      runInstall: async (command, args) => {
        if (networkSealed) {
          throw new Error("Registry network phase is already sealed");
        }
        if (
          command !== "npm" || args[0] !== "ci" ||
          !args.includes("--ignore-scripts") || !args.includes("--include=dev")
        ) {
          throw new Error("Install phase requires npm ci --ignore-scripts --include=dev");
        }
        if (!this.registryEgress) {
          // No network is safer than silently granting broad egress. This can
          // succeed only when the lockfile requires no uncached downloads.
          return exec(command, args, "none");
        }
        try {
          return await exec(command, args, "registry_proxy", {
            HTTPS_PROXY: this.registryEgress.proxyUrl,
            HTTP_PROXY: this.registryEgress.proxyUrl,
            NO_PROXY: "",
            npm_config_registry: "https://registry.npmjs.org/",
          });
        } finally {
          await docker(["network", "disconnect", this.registryEgress.networkName, containerName], 30_000);
        }
      },
      sealNetwork: async () => {
        networkSealed = true;
        const inspect = await docker([
          "inspect", "--format", "{{json .NetworkSettings.Networks}}", containerName,
        ], 30_000);
        const networks = JSON.parse(inspect.stdout.trim()) as Record<string, unknown>;
        if (Object.keys(networks).some((name) => name !== "none")) {
          throw new Error("Isolated runner retained a network after sealing");
        }
      },
      run: async (command, args) => {
        if (!networkSealed) {
          throw new Error("Network must be sealed before repository-controlled commands run");
        }
        return exec(command, args, "none");
      },
      readTextArtifact: async (containerPath) => {
        if (!containerPath.startsWith("/workspace/.dca-output/") || containerPath.includes("..")) {
          throw new Error("Only explicit structured result artifacts may leave the runner");
        }
        const size = await exec("node", [
          "-e",
          `process.stdout.write(String(require('node:fs').statSync(${JSON.stringify(containerPath)}).size))`,
        ], "none");
        if (size.exitCode !== 0 || size.timedOut) {
          throw new Error("Could not validate isolated artifact size");
        }
        const byteLength = Number(size.stdout);
        if (!Number.isSafeInteger(byteLength) || byteLength < 0 || byteLength > this.limits.outputBytes) {
          throw new Error(`Isolated artifact exceeds output limit: ${byteLength}`);
        }
        const artifact = await exec("node", [
          "-e",
          `process.stdout.write(require('node:fs').readFileSync(${JSON.stringify(containerPath)}))`,
        ], "none");
        if (artifact.exitCode !== 0 || artifact.timedOut || Buffer.byteLength(artifact.stdout) !== byteLength) {
          throw new Error("Could not read complete isolated artifact");
        }
        return artifact.stdout;
      },
      copyOut: async (containerPath, destinationPath) => {
        if (!containerPath.startsWith("/workspace/") || containerPath.includes("..")) {
          throw new Error("Only explicit workspace artifacts may leave the runner");
        }
        await docker(["cp", `${containerName}:${containerPath}`, destinationPath], 60_000);
      },
      dispose: async () => {
        if (disposed) {
          return;
        }
        await docker(["rm", "-f", containerName], 60_000);
        const inspection = await this.processRunner("docker", ["inspect", containerName], {
          cwd: canonicalSource,
          env: allowlistedEnvironment(),
          timeoutMs: 30_000,
          outputLimitBytes: this.limits.outputBytes,
        });
        if (inspection.exitCode === 0) {
          throw new Error(`Container cleanup could not be verified: ${containerName}`);
        }
        disposed = true;
      },
    };
  }
}

export function configuredDockerRunner(): DockerIsolatedRunner {
  const image = process.env.DCA_RUNNER_IMAGE;
  if (!image) {
    throw new Error("DCA_RUNNER_IMAGE is required; host execution is not a permitted fallback");
  }
  const networkName = process.env.DCA_REGISTRY_NETWORK;
  const proxyUrl = process.env.DCA_REGISTRY_PROXY_URL;
  if ((networkName && !proxyUrl) || (!networkName && proxyUrl)) {
    throw new Error("DCA_REGISTRY_NETWORK and DCA_REGISTRY_PROXY_URL must be configured together");
  }
  return new DockerIsolatedRunner(
    image,
    DEFAULT_ISOLATED_LIMITS,
    runProcess,
    networkName && proxyUrl ? { networkName, proxyUrl } : undefined,
  );
}
