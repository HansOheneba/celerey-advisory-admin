import "server-only";

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildDemoDatabase, DEMO_DB_VERSION } from "@/lib/demo/seed";
import type { DemoDatabase } from "@/lib/demo/types";

function isServerlessRuntime() {
  return (
    process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
  );
}

/** Vercel/Lambda only allow writes under /tmp; local dev uses project .data. */
function resolveDataDir() {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "celerey-demo-data");
  }

  return path.join(process.cwd(), ".data");
}

const DATA_DIR = resolveDataDir();
const DB_PATH = path.join(DATA_DIR, "demo-store.json");

export const REPORTS_DIR = path.join(DATA_DIR, "reports");

let cached: DemoDatabase | null = null;
let cachedMtimeMs = 0;
let inFlight: Promise<DemoDatabase> | null = null;
/** When disk is unavailable, keep the demo DB in memory for this isolate. */
let memoryOnly = false;
/** Serialises writes so concurrent server actions cannot clobber each other. */
let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureDataDir() {
  if (memoryOnly) {
    return;
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    memoryOnly = true;
  }
}

async function diskMtimeMs(): Promise<number> {
  try {
    return (await stat(DB_PATH)).mtimeMs;
  } catch {
    return 0;
  }
}

async function persist(db: DemoDatabase) {
  cached = db;

  if (memoryOnly) {
    cachedMtimeMs = Date.now();
    return;
  }

  try {
    await ensureDataDir();
    await writeFile(DB_PATH, JSON.stringify(db), "utf8");
    cachedMtimeMs = await diskMtimeMs();
  } catch {
    memoryOnly = true;
    cachedMtimeMs = Date.now();
  }
}

async function loadFromDisk(): Promise<DemoDatabase> {
  if (memoryOnly) {
    return cached ?? buildDemoDatabase();
  }

  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as DemoDatabase;

    if (parsed.version === DEMO_DB_VERSION) {
      return parsed;
    }
  } catch {
    // No usable store on disk — fall through and seed a fresh one.
  }

  const seeded = buildDemoDatabase();
  await persist(seeded);
  return seeded;
}

/**
 * Read the demo database, seeding it on first use.
 * Reloads when another isolate (server action vs route handler) wrote the file.
 */
export async function readDemoDb(): Promise<DemoDatabase> {
  const mtime = await diskMtimeMs();

  if (cached && mtime > 0 && mtime === cachedMtimeMs) {
    return cached;
  }

  if (!inFlight) {
    inFlight = loadFromDisk()
      .then(async (db) => {
        cached = db;
        cachedMtimeMs = await diskMtimeMs();
        inFlight = null;
        return db;
      })
      .catch((error: unknown) => {
        inFlight = null;
        throw error;
      });
  }

  return inFlight;
}

/**
 * Apply a mutation and persist it. The mutator receives the live object and
 * may return a value to pass back to the caller.
 */
export async function mutateDemoDb<T>(
  mutator: (db: DemoDatabase) => T | Promise<T>,
): Promise<T> {
  const run = writeQueue.then(async () => {
    const db = await readDemoDb();
    const result = await mutator(db);
    await persist(db);
    return result;
  });

  writeQueue = run.catch(() => undefined);
  return run;
}

/** Rebuild the demo data from seed — used by the reset control in settings. */
export async function resetDemoDb(): Promise<DemoDatabase> {
  return writeQueue.then(async () => {
    const seeded = buildDemoDatabase();
    await persist(seeded);
    return seeded;
  });
}

export async function ensureReportsDir() {
  if (memoryOnly) {
    return;
  }

  try {
    await mkdir(REPORTS_DIR, { recursive: true });
  } catch {
    memoryOnly = true;
  }
}
