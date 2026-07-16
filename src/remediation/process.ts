import { spawn } from "node:child_process";

import type { ProcessResult } from "./types";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1_000;
const DEFAULT_OUTPUT_LIMIT_BYTES = 256 * 1_024;
const STOP_GRACE_MS = 5_000;

function appendBounded(current: string, chunk: Buffer, limit: number): string {
  if (current.length >= limit) {
    return current;
  }
  const remaining = limit - current.length;
  return current + chunk.toString("utf8", 0, remaining);
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
      env: options.env ?? process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendBounded(stdout, chunk, outputLimit);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendBounded(stderr, chunk, outputLimit);
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timer);
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
    env: options.env ?? process.env,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
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
      child.kill("SIGTERM");
      const forceTimer = setTimeout(() => {
        if (!result) {
          child.kill("SIGKILL");
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
