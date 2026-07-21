import { spawn } from "node:child_process";

import type { ProcessResult } from "./types";
import { allowlistedEnvironment } from "../security/environment";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1_000;
const DEFAULT_OUTPUT_LIMIT_BYTES = 256 * 1_024;
const STOP_GRACE_MS = 5_000;

function appendBounded(current: string, chunk: Buffer, limit: number): string {
  const currentBytes = Buffer.byteLength(current);
  if (currentBytes >= limit) {
    return current;
  }
  const remaining = limit - currentBytes;
  return current + chunk.toString("utf8", 0, remaining);
}

function signalProcessTree(childPid: number | undefined, signal: NodeJS.Signals): void {
  if (childPid === undefined) {
    return;
  }
  try {
    if (process.platform === "win32") {
      process.kill(childPid, signal);
    } else {
      process.kill(-childPid, signal);
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ESRCH") {
      throw error;
    }
  }
}

export async function runProcess(
  command: string,
  args: string[],
  options: {
    cwd: string;
    env?: NodeJS.ProcessEnv;
    timeoutMs?: number;
    outputLimitBytes?: number;
  },
): Promise<ProcessResult> {
  const started = new Date();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const outputLimit = options.outputLimitBytes ?? DEFAULT_OUTPUT_LIMIT_BYTES;

  return await new Promise<ProcessResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? allowlistedEnvironment(),
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let forceTimer: NodeJS.Timeout | undefined;
    const timer = setTimeout(() => {
      timedOut = true;
      signalProcessTree(child.pid, "SIGTERM");
      forceTimer = setTimeout(() => signalProcessTree(child.pid, "SIGKILL"), STOP_GRACE_MS);
      forceTimer.unref();
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendBounded(stdout, chunk, outputLimit);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendBounded(stderr, chunk, outputLimit);
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      if (forceTimer) {
        clearTimeout(forceTimer);
      }
      reject(error);
    });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timer);
      if (forceTimer) {
        clearTimeout(forceTimer);
      }
      const completed = new Date();
      resolve({
        command,
        args,
        cwd: options.cwd,
        exitCode,
        signal,
        stdout,
        stderr,
        startedAt: started.toISOString(),
        completedAt: completed.toISOString(),
        durationMs: completed.getTime() - started.getTime(),
        timedOut,
      });
    });
  });
}

export interface ManagedProcess {
  currentResult(): ProcessResult | undefined;
  stop(): Promise<ProcessResult>;
}

export function startManagedProcess(
  command: string,
  args: string[],
  options: {
    cwd: string;
    env?: NodeJS.ProcessEnv;
    outputLimitBytes?: number;
  },
): ManagedProcess {
  const started = new Date();
  const outputLimit = options.outputLimitBytes ?? DEFAULT_OUTPUT_LIMIT_BYTES;
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env ?? allowlistedEnvironment(),
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
  });
  let stdout = "";
  let stderr = "";
  let result: ProcessResult | undefined;
  let spawnError: Error | undefined;

  child.stdout.on("data", (chunk: Buffer) => {
    stdout = appendBounded(stdout, chunk, outputLimit);
  });
  child.stderr.on("data", (chunk: Buffer) => {
    stderr = appendBounded(stderr, chunk, outputLimit);
  });

  const completed = new Promise<ProcessResult>((resolve) => {
    child.once("error", (error) => {
      spawnError = error;
    });
    child.once("close", (exitCode, signal) => {
      const finished = new Date();
      result = {
        command,
        args,
        cwd: options.cwd,
        exitCode,
        signal,
        stdout,
        stderr: spawnError ? `${stderr}\n${spawnError.message}`.trim() : stderr,
        startedAt: started.toISOString(),
        completedAt: finished.toISOString(),
        durationMs: finished.getTime() - started.getTime(),
        timedOut: false,
      };
      resolve(result);
    });
  });

  return {
    currentResult: () => result,
    stop: async () => {
      if (result) {
        return result;
      }
      signalProcessTree(child.pid, "SIGTERM");
      const forceTimer = setTimeout(() => {
        if (!result) {
          signalProcessTree(child.pid, "SIGKILL");
        }
      }, STOP_GRACE_MS);
      try {
        return await completed;
      } finally {
        clearTimeout(forceTimer);
      }
    },
  };
}
