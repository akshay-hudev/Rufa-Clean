import type { GateResult } from "./types";

export interface HumanReviewFallback {
  status: "human_review_required";
  reason: string;
  automatedRepairAttempted: false;
  prOpened: false;
}

const MAX_DIAGNOSTIC_LENGTH = 1_000;

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_DIAGNOSTIC_LENGTH);
}

export function humanReviewFallback(gate: GateResult): HumanReviewFallback | undefined {
  if (gate.status === "passed") {
    return undefined;
  }

  const failedCommand = gate.commands.find(
    (command) => command.exitCode !== 0 || command.timedOut,
  );
  const commandSummary = failedCommand
    ? `${failedCommand.kind} command ${failedCommand.command} ${failedCommand.args.join(" ")} ` +
      (failedCommand.timedOut ? "timed out" : `exited ${failedCommand.exitCode}`)
    : "the gate could not complete";
  const diagnostic = failedCommand
    ? compact(failedCommand.stderr || failedCommand.stdout)
    : "";
  const reason = [
    `Human review required: ${gate.failure ?? "build/test gate did not pass"}.`,
    commandSummary + ".",
    diagnostic ? `Diagnostic: ${diagnostic}` : "",
    "No automated repair was attempted and no pull request was opened.",
  ].filter(Boolean).join(" ");

  return {
    status: "human_review_required",
    reason,
    automatedRepairAttempted: false,
    prOpened: false,
  };
}
