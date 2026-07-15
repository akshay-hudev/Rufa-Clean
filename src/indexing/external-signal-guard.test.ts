import { describe, expect, it } from "vitest";

import { zeroExternalSignalsWarning } from "./sync";

describe("zeroExternalSignalsWarning", () => {
  it("warns when a repository has symbols but no attributed analyzer rows", () => {
    expect(zeroExternalSignalsWarning("PDM", 231, 0)).toContain(
      "231 symbols were stored but zero repository-attributed external_signals",
    );
  });

  it("does not warn when signals exist or no symbols were extracted", () => {
    expect(zeroExternalSignalsWarning("PDM", 231, 1)).toBeUndefined();
    expect(zeroExternalSignalsWarning("empty", 0, 0)).toBeUndefined();
  });
});
