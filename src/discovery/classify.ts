export function classifyByMarkers(fileList: string[]): string[] {
  const entries = new Set(fileList);
  const labels: string[] = [];
  const commonApplicationDirectories = [
    "backend",
    "frontend",
    "client",
    "server",
    "api",
    "web",
    "services",
  ];

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

  const hasApplicationMarker = ["Dockerfile", "package.json"].some(
    (marker) =>
      entries.has(marker) ||
      commonApplicationDirectories.some((directory) => entries.has(`${directory}/${marker}`)),
  );
  if (hasApplicationMarker) {
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
