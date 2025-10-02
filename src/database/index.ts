import { PgDialect, type PgSession } from "drizzle-orm/pg-core";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import { md5 } from "@noble/hashes/legacy.js";
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils.js";

import migrations from "./migrations/export.json";
import * as schema from "./schema";
import { createSignal, createRoot, createEffect } from "solid-js";

export default createRoot(() => {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<Error>();

  const client = new PGlite("idb://hikari");
  const db = drizzle({ client, schema });

  createEffect(async () => {
    const hash = bytesToHex(md5(utf8ToBytes(JSON.stringify(migrations))));
    if (localStorage.getItem("migration") === hash) {
      console.log("[database]: you're on the latest migration!");
      setLoading(false);
      return;
    }

    try {
      console.info("[database]: starting migration...");
      const start = performance.now();
      setLoading(true);

      await new PgDialect().migrate(
        migrations,
        db._.session as unknown as PgSession,
        "hikari"
      );

      console.info(`[database]: ready in ${performance.now() - start}ms`);
      localStorage.setItem("migration", hash);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error(String(error)));
      }

      console.error("[database]: schema migration failed", error);
    } finally {
      setLoading(false);
    }
  });

  return {
    client: db,
    schema,
    get loading() {
      return loading();
    },
    get error() {
      return error();
    },
  };
});
