import { cleanupBarrelReexports, type BarrelCleanupResult } from "./barrel-cleanup";
import { runSimplePiranhaRemoval } from "./piranha";
import type { PiranhaLanguage, PiranhaResult } from "./types";

export interface BarrelRemovalResult {
  piranha: PiranhaResult;
  cleanup: BarrelCleanupResult;
}

export async function runBarrelAwareRemoval(
  repositoryPath: string,
  filePath: string,
  symbolName: string,
  language: PiranhaLanguage,
): Promise<BarrelRemovalResult> {
  const piranha = await runSimplePiranhaRemoval(
    repositoryPath,
    filePath,
    symbolName,
    language,
    { allowExported: true },
  );
  const cleanup = await cleanupBarrelReexports(repositoryPath, filePath, symbolName);
  return { piranha, cleanup };
}
