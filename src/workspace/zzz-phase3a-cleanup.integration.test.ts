import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const adminUrl = process.env.DCA_TEST_DATABASE_URL;
const image = process.env.DCA_RUNNER_IMAGE;
const describeCleanup = adminUrl && image ? describe : describe.skip;

function withDatabaseName(url: string, name: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${name}`;
  return parsed.toString();
}

describeCleanup("Phase 3A owned-resource cleanup", () => {
  const created = {
    databases: [] as string[],
    workspaces: [] as string[],
    containers: [] as string[],
    networks: [] as string[],
  };

  afterAll(async () => {
    for (const name of created.databases) {
      try {
        const admin = new Pool({ connectionString: adminUrl });
        try {
          await admin.query(`
            SELECT pg_terminate_backend(pid)
              FROM pg_stat_activity
             WHERE datname = $1 AND pid <> pg_backend_pid()
          `, [name]);
          await admin.query(`DROP DATABASE IF EXISTS ${name}`);
        } finally {
          await admin.end();
        }
      } catch {
        // safety net
      }
    }
    for (const root of created.workspaces) {
      await rm(root, { recursive: true, force: true });
    }
    for (const container of created.containers) {
      try {
        await execFileAsync("docker", ["rm", "-f", container]);
      } catch {
        // already absent
      }
    }
    for (const network of created.networks) {
      try {
        await execFileAsync("docker", ["network", "rm", network]);
      } catch {
        // already absent
      }
    }
  });

  it("p3a-owned-resource-cleanup: create, remove, and verify absence with inventory", async () => {
    const stamp = Date.now().toString(36);
    const databaseName = `dcav2_phase3a_cleanup_${stamp}`;
    expect(databaseName.startsWith("dcav2_phase3a_")).toBe(true);

    const admin = new Pool({ connectionString: adminUrl });
    try {
      await admin.query(`CREATE DATABASE ${databaseName}`);
      created.databases.push(databaseName);
      const disposable = new Pool({ connectionString: withDatabaseName(adminUrl!, databaseName) });
      try {
        await disposable.query("SELECT 1");
      } finally {
        await disposable.end();
      }
    } finally {
      await admin.end();
    }

    const workspace = await mkdtemp(join(tmpdir(), "dcav2-phase3a-cleanup-ws-"));
    created.workspaces.push(workspace);
    const npmHome = await mkdtemp(join(tmpdir(), "dcav2-phase3a-cleanup-npm-"));
    created.workspaces.push(npmHome);
    await writeFile(join(workspace, "marker.txt"), "phase3a-owned\n");
    await writeFile(join(npmHome, "marker.txt"), "phase3a-npm-home\n");

    const networkName = `dcav2-phase3a-cleanup-net-${stamp}`;
    await execFileAsync("docker", ["network", "create", "--internal", networkName]);
    created.networks.push(networkName);

    const containerName = `dcav2-phase3a-cleanup-ctr-${stamp}`;
    await execFileAsync("docker", [
      "create",
      "--name", containerName,
      "--network", networkName,
      image!,
      "sleep", "30",
    ]);
    created.containers.push(containerName);

    const inventoryBefore = {
      databases: [...created.databases],
      workspaces: [...created.workspaces],
      containers: [...created.containers],
      networks: [...created.networks],
    };
    expect(inventoryBefore.databases.length).toBe(1);
    expect(inventoryBefore.workspaces.length).toBe(2);
    expect(inventoryBefore.containers.length).toBe(1);
    expect(inventoryBefore.networks.length).toBe(1);

    const dropAdmin = new Pool({ connectionString: adminUrl });
    try {
      for (const name of inventoryBefore.databases) {
        await dropAdmin.query(`
          SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
           WHERE datname = $1 AND pid <> pg_backend_pid()
        `, [name]);
        await dropAdmin.query(`DROP DATABASE IF EXISTS ${name}`);
      }
    } finally {
      await dropAdmin.end();
    }
    for (const root of inventoryBefore.workspaces) {
      await rm(root, { recursive: true, force: true });
    }
    for (const container of inventoryBefore.containers) {
      await execFileAsync("docker", ["rm", "-f", container]);
    }
    for (const network of inventoryBefore.networks) {
      await execFileAsync("docker", ["network", "rm", network]);
    }

    const verifyAdmin = new Pool({ connectionString: adminUrl });
    try {
      for (const name of inventoryBefore.databases) {
        const row = await verifyAdmin.query(
          "SELECT 1 FROM pg_database WHERE datname = $1",
          [name],
        );
        expect(row.rowCount).toBe(0);
      }
    } finally {
      await verifyAdmin.end();
    }
    for (const root of inventoryBefore.workspaces) {
      await expect(rm(root, { recursive: false })).rejects.toThrow();
    }
    for (const container of inventoryBefore.containers) {
      const inspect = await execFileAsync("docker", ["inspect", container]).then(
        () => "present",
        () => "absent",
      );
      expect(inspect).toBe("absent");
    }
    for (const network of inventoryBefore.networks) {
      const inspect = await execFileAsync("docker", ["network", "inspect", network]).then(
        () => "present",
        () => "absent",
      );
      expect(inspect).toBe("absent");
    }

    const imageInspect = await execFileAsync("docker", [
      "image", "inspect", image!, "--format", "ok",
    ]);
    expect(imageInspect.stdout.trim()).toBe("ok");

    created.databases = [];
    created.workspaces = [];
    created.containers = [];
    created.networks = [];
  }, 120_000);
});
