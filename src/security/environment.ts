const SAFE_HOST_KEYS = ["PATH", "LANG", "LC_ALL", "TMPDIR"] as const;

/**
 * Construct a new environment instead of copying process.env. Only mundane
 * process-locating/locale values are inherited; callers must explicitly add
 * every other value.
 */
export function allowlistedEnvironment(
  additions: Readonly<Record<string, string | undefined>> = {},
  source: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {};
  for (const key of SAFE_HOST_KEYS) {
    const value = source[key];
    if (value !== undefined) {
      environment[key] = value;
    }
  }
  for (const [key, value] of Object.entries(additions)) {
    if (value !== undefined) {
      environment[key] = value;
    }
  }
  return environment;
}

export const ISOLATED_REPOSITORY_ENVIRONMENT: Readonly<Record<string, string>> = Object.freeze({
  CI: "true",
  HOME: "/tmp/dca-home",
  LANG: "C.UTF-8",
  LC_ALL: "C.UTF-8",
  // Repository verification requires the development dependency tree. Do not
  // inherit a production-mode default from the trusted runner image or npm
  // configuration, because npm interprets that as `--omit=dev`.
  NODE_ENV: "development",
  NPM_CONFIG_OMIT: "",
  NPM_CONFIG_PRODUCTION: "false",
  NO_COLOR: "1",
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
});
