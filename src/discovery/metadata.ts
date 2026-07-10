export interface PrimaryLanguage {
  language: string;
  loc: number;
  pct: number;
}

export function toPrimaryLanguages(byteCounts: Record<string, number>): PrimaryLanguage[] {
  const totalBytes = Object.values(byteCounts).reduce((total, bytes) => total + bytes, 0);

  return Object.entries(byteCounts).map(([language, bytes]) => ({
    language,
    // GitHub reports bytes by language; use that value as a LOC proxy for now.
    loc: bytes,
    pct: totalBytes === 0 ? 0 : Number(((bytes / totalBytes) * 100).toFixed(2)),
  }));
}

export function detectBuildSystem(fileList: string[]): string | null {
  const fileNames = new Set(fileList.map((entry) => entry.split("/").at(-1)));
  const matches = new Set<string>();

  if (fileNames.has("package.json")) matches.add("npm");
  if (fileNames.has("go.mod")) matches.add("go_mod");
  if (fileNames.has("requirements.txt") || fileNames.has("pyproject.toml")) matches.add("pip");
  if (fileNames.has("pom.xml")) matches.add("maven");
  if (fileNames.has("build.gradle")) matches.add("gradle");
  if (fileNames.has("Cargo.toml")) matches.add("cargo");
  if ([...fileNames].some((name) => name?.endsWith(".csproj"))) matches.add("dotnet");

  if (matches.size === 0) return null;
  if (matches.size > 1) return "mixed";
  return matches.values().next().value ?? null;
}
