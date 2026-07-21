import { describe, expect, it } from "vitest";

import { runSimpleRemovalPipeline } from "./pipeline";

describe("quarantined legacy removal pipeline", () => {
  it("cannot generate a patch from only a legacy confidence verdict", async () => {
    await expect(runSimpleRemovalPipeline("legacy-verdict")).rejects.toThrow(
      /Legacy confidence-verdict remediation is disabled/,
    );
  });

  it("cannot use the old unreviewed draft-PR option", async () => {
    await expect(runSimpleRemovalPipeline("legacy-verdict", { draftReview: true })).rejects.toThrow(
      /approved_for_remediation/,
    );
  });
});
