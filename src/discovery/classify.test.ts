import { describe, expect, it } from "vitest";

import { classifyByMarkers } from "./classify";

describe("classifyByMarkers", () => {
  it("classifies Helm chart repositories", () => {
    expect(classifyByMarkers(["Chart.yaml", "values.yaml"])).toEqual(["helm_chart_repo"]);
  });

  it("classifies Terraform module repositories", () => {
    expect(classifyByMarkers(["README.md", "main.tf"])).toEqual(["terraform_module_repo"]);
  });

  it.each([["kustomization.yaml"], ["k8s"], ["manifests"]])(
    "classifies Kubernetes manifest repositories containing %s",
    (marker) => {
      expect(classifyByMarkers([marker])).toEqual(["k8s_manifest_repo"]);
    },
  );

  it.each(["openapi.yaml", "openapi.yml", "swagger.json"])(
    "classifies API contract repositories containing %s",
    (marker) => {
      expect(classifyByMarkers([marker])).toEqual(["api_contract_repo"]);
    },
  );

  it("classifies schema repositories", () => {
    expect(classifyByMarkers(["events.proto"])).toEqual(["schema_repo"]);
  });

  it.each(["Dockerfile", "package.json"])(
    "classifies application services with a root %s",
    (marker) => {
      expect(classifyByMarkers([marker])).toEqual(["application_service"]);
    },
  );

  it.each(["backend", "frontend", "client", "server", "api", "web", "services"])(
    "classifies application services with a marker one level inside %s",
    (directory) => {
      expect(classifyByMarkers([directory, `${directory}/package.json`])).toEqual([
        "application_service",
      ]);
    },
  );

  it("does not inspect application markers below the supported depth", () => {
    expect(classifyByMarkers(["backend", "backend/nested/package.json"])).toEqual(["unknown"]);
  });

  it("classifies CI/CD repositories without source directories", () => {
    expect(classifyByMarkers([".github", "README.md"])).toEqual(["cicd_repo"]);
    expect(classifyByMarkers([".github", "src"])).toEqual(["unknown"]);
    expect(classifyByMarkers([".github", "app"])).toEqual(["unknown"]);
  });

  it.each(["backend", "frontend", "client", "server"])(
    "does not classify repositories with .github and a %s directory as CI/CD-only",
    (directory) => {
      expect(classifyByMarkers([".github", directory])).toEqual(["unknown"]);
    },
  );

  it("falls back to unknown when no markers match", () => {
    expect(classifyByMarkers(["README.md", "LICENSE"])).toEqual(["unknown"]);
  });

  it("returns all matching labels", () => {
    expect(classifyByMarkers(["Chart.yaml", "main.tf"])).toEqual([
      "helm_chart_repo",
      "terraform_module_repo",
    ]);
  });
});
