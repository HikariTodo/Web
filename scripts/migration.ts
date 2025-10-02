//! A quick migration generator for Drizzle.

import { readMigrationFiles } from "drizzle-orm/migrator";
import fs from "node:fs/promises";

const meta = readMigrationFiles({
  migrationsFolder: "src/database/migrations",
});

let migrations = JSON.stringify(meta, null, 2);
migrations = migrations.replaceAll(
  "CREATE TABLE",
  "CREATE TABLE IF NOT EXISTS"
);

await fs.writeFile("src/database/migrations/export.json", migrations, "utf8");
