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

  it("classifies application services with a root Dockerfile", () => {
    expect(classifyByMarkers(["Dockerfile"])).toEqual(["application_service"]);
  });

  it.each(["backend", "frontend", "client", "server"])(
    "classifies application services with a Dockerfile one level inside %s",
    (directory) => {
      expect(classifyByMarkers([directory, `${directory}/Dockerfile`])).toEqual([
        "application_service",
      ]);
    },
  );

  it.each(["vercel.json", "railway.toml", "netlify.toml", "Procfile", "fly.toml"])(
    "classifies deployment config %s as an application service",
    (config) => {
      expect(classifyByMarkers([config])).toEqual(["application_service"]);
    },
  );

  it.each(["start", "dev"])("uses package.json scripts.%s as an app signal", (script) => {
    const packageJson = JSON.stringify({ scripts: { [script]: "run-server" } });
    expect(classifyByMarkers(["package.json"], { "package.json": packageJson })).toEqual([
      "application_service",
    ]);
  });

  it.each(["express", "fastify", "next", "nestjs", "@nestjs/core"])(
    "uses a %s dependency as an app signal",
    (dependency) => {
      const path = "backend/package.json";
      const packageJson = JSON.stringify({ dependencies: { [dependency]: "1.0.0" } });
      expect(classifyByMarkers(["backend", path], { [path]: packageJson })).toEqual([
        "application_service",
      ]);
    },
  );

  it.each(["flask", "fastapi", "django"])(
    "uses a %s Python dependency as an app signal",
    (framework) => {
      expect(
        classifyByMarkers(["requirements.txt"], { "requirements.txt": `${framework}==1.0` }),
      ).toEqual(["application_service"]);
    },
  );

  it("requires a main package for Go applications", () => {
    expect(
      classifyByMarkers(["go.mod", "main.go"], {
        "go.mod": "module example.com/service",
        "main.go": "package main\nfunc main() {}",
      }),
    ).toEqual(["application_service"]);
    expect(
      classifyByMarkers(["go.mod", "library.go"], {
        "go.mod": "module example.com/library",
        "library.go": "package library",
      }),
    ).toEqual(["unknown"]);
  });

  it("does not classify a manifest without a runnable application signal", () => {
    expect(
      classifyByMarkers(["package.json"], {
        "package.json": JSON.stringify({ name: "utility-library", scripts: { test: "vitest" } }),
      }),
    ).toEqual(["unknown"]);
    expect(
      classifyByMarkers(["pyproject.toml"], {
        "pyproject.toml": 'dependencies = ["requests"]',
      }),
    ).toEqual(["unknown"]);
  });

  it("does not inspect application markers below the supported depth", () => {
    expect(classifyByMarkers(["backend", "backend/nested/Dockerfile"])).toEqual(["unknown"]);
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
