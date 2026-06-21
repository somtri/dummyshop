import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { __dummyshopPool?: Pool };

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function allowInMemoryStore() {
  return process.env.NODE_ENV === "test" || (process.env.NODE_ENV === "development" && process.env.ALLOW_IN_MEMORY_DEV === "true");
}

export function getStorageMode() {
  if (hasDatabaseUrl()) return "postgres" as const;
  if (allowInMemoryStore()) return "memory" as const;
  return "unavailable" as const;
}

export function getDb() {
  if (!hasDatabaseUrl()) {
    throw new Error("storage_unavailable");
  }
  if (!globalForDb.__dummyshopPool) {
    globalForDb.__dummyshopPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  }
  return globalForDb.__dummyshopPool;
}

export async function canReachDatabase() {
  if (!hasDatabaseUrl()) return false;
  try {
    await getDb().query("select 1");
    return true;
  } catch {
    return false;
  }
}
