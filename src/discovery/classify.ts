const DOCKER_DIRECTORIES = ["backend", "frontend", "server", "client"];
const DEPLOYMENT_CONFIGS = ["vercel.json", "railway.toml", "netlify.toml", "Procfile", "fly.toml"];

function packageJsonHasApplicationSignal(content: string): boolean {
  try {
    const parsed = JSON.parse(content) as {
      scripts?: Record<string, unknown>;
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
    };
    const scripts = parsed.scripts ?? {};
    const dependencies = { ...parsed.dependencies, ...parsed.devDependencies };
    const frameworks = ["express", "fastify", "next", "nestjs", "@nestjs/core"];

    return Boolean(scripts.start || scripts.dev) || frameworks.some((name) => name in dependencies);
  } catch {
    return false;
  }
}

function hasRunnableManifest(
  fileList: string[],
  fileContents: Readonly<Record<string, string>>,
): boolean {
  const packageFiles = fileList.filter((path) => path.split("/").at(-1) === "package.json");
  if (packageFiles.some((path) => packageJsonHasApplicationSignal(fileContents[path] ?? ""))) {
    return true;
  }

  const pythonManifests = fileList.filter((path) => {
    const name = path.split("/").at(-1);
    return name === "requirements.txt" || name === "pyproject.toml";
  });
  const pythonFramework = /(?:^|[^a-z0-9_-])(flask|fastapi|django)(?:[^a-z0-9_-]|$)/i;
  if (pythonManifests.some((path) => pythonFramework.test(fileContents[path] ?? ""))) {
    return true;
  }

  const hasGoModule = fileList.some((path) => path.split("/").at(-1) === "go.mod");
  return (
    hasGoModule &&
    Object.entries(fileContents).some(
      ([path, content]) => path.endsWith(".go") && /^\s*package\s+main\b/m.test(content),
    )
  );
}

export function classifyByMarkers(
  fileList: string[],
  fileContents: Readonly<Record<string, string>> = {},
): string[] {
  const entries = new Set(fileList);
  const labels: string[] = [];

  if (entries.has("Chart.yaml")) {
    labels.push("helm_chart_repo");
  }

  if (fileList.some((entry) => !entry.includes("/") && entry.endsWith(".tf"))) {
    labels.push("terraform_module_repo");
  }

  if (
    entries.has("kustomization.yaml") ||
    fileList.some((entry) => /^(k8s|manifests)$/.test(entry))
  ) {
    labels.push("k8s_manifest_repo");
  }

  if (
    entries.has("openapi.yaml") ||
    entries.has("openapi.yml") ||
    entries.has("swagger.json")
  ) {
    labels.push("api_contract_repo");
  }

  if (fileList.some((entry) => !entry.includes("/") && entry.endsWith(".proto"))) {
    labels.push("schema_repo");
  }

  const hasDockerfile =
    entries.has("Dockerfile") ||
    DOCKER_DIRECTORIES.some((directory) => entries.has(`${directory}/Dockerfile`));
  const hasDeploymentConfig = DEPLOYMENT_CONFIGS.some((config) => entries.has(config));
  if (hasDockerfile || hasRunnableManifest(fileList, fileContents) || hasDeploymentConfig) {
    labels.push("application_service");
  }

  const hasApplicationCodeDirectory = [
    "src",
    "app",
    "backend",
    "frontend",
    "client",
    "server",
  ].some((directory) => entries.has(directory));
  if (entries.has(".github") && !hasApplicationCodeDirectory) {
    labels.push("cicd_repo");
  }

  return labels.length > 0 ? labels : ["unknown"];
}
