export function classifyByMarkers(fileList: string[]): string[] {
  const entries = new Set(fileList);
  const labels: string[] = [];

  if (entries.has("Chart.yaml")) {
    labels.push("helm_chart_repo");
  }

  if (fileList.some((entry) => entry.endsWith(".tf"))) {
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

  if (fileList.some((entry) => entry.endsWith(".proto"))) {
    labels.push("schema_repo");
  }

  if (entries.has("Dockerfile") && entries.has("package.json")) {
    labels.push("application_service");
  }

  if (entries.has(".github") && !entries.has("src") && !entries.has("app")) {
    labels.push("cicd_repo");
  }

  return labels.length > 0 ? labels : ["unknown"];
}
