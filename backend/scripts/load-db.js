#!/usr/bin/env node
// Database loader with legacy and consolidated-baseline modes.
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const DATABASE_DIR = path.join(__dirname, "..", "..", "database");
const LEGACY_FILES = [
  "schema.v2.sql", "schema.v2.1.sql", "seed.v2.sql", "seed.v2.1.sql",
  "schema.v2.2.sql", "seed.v2.2.sql", "schema.v2.3.sql", "seed.v2.3.sql",
  "schema.v2.4.sql", "seed.v2.4.sql", "schema.v2.5.sql", "schema.v2.6.sql",
  "seed.v2.6.sql", "schema.v2.7.sql",
];
const BASELINE_FILES = ["baseline/schema.sql", "baseline/seed.sql"];

const args = process.argv.slice(2);
const baselineMode = args.includes("--baseline");
const wantsReset = args.includes("--reset");
const skipPrompt = args.includes("--yes") || args.includes("-y");
const databaseArg = args.find((arg) => arg.startsWith("--database="));
const configuredDb = process.env.PGDATABASE || "shahebbazar";
const dbName = databaseArg
  ? databaseArg.slice("--database=".length)
  : baselineMode
    ? `${configuredDb}_baseline_test`
    : configuredDb;
const files = baselineMode ? BASELINE_FILES : LEGACY_FILES;
const connection = {
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
};

function validateDatabaseName(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`Invalid database name: ${name}`);
}
function quoteIdentifier(name) {
  validateDatabaseName(name);
  return `"${name.replaceAll('"', '""')}"`;
}
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim().toLowerCase());
  }));
}
async function withAdminClient(fn) {
  const client = new Client({ ...connection, database: "postgres" });
  await client.connect();
  try { return await fn(client); } finally { await client.end(); }
}
async function main() {
  validateDatabaseName(dbName);
  for (const file of files) {
    const fullPath = path.join(DATABASE_DIR, file);
    if (!fs.existsSync(fullPath)) throw new Error(`Missing SQL file: ${fullPath}`);
  }
  if (baselineMode && !dbName.endsWith("_test")) {
    throw new Error("Baseline mode requires a database name ending in _test.");
  }
  if (wantsReset && !skipPrompt) {
    const answer = await ask(`This drops database "${dbName}". Continue? (yes/no) `);
    if (!['yes', 'y'].includes(answer)) return console.log("Cancelled. No changes made.");
  }
  await withAdminClient(async (admin) => {
    if (wantsReset) {
      await admin.query(
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
        [dbName]
      );
      await admin.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(dbName)}`);
      console.log(`Dropped database ${dbName}`);
    }
    const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (!exists.rowCount) {
      await admin.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
      console.log(`Created database ${dbName}`);
    }
  });
  const client = new Client({ ...connection, database: dbName });
  await client.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(DATABASE_DIR, file), "utf8").replace(/^\uFEFF/, "");
      await client.query(sql);
      console.log(`  applied ${file}`);
    }
    const summary = await client.query(`
      SELECT 'businesses' AS item, COUNT(*)::int AS n FROM v_business_cards
      UNION ALL SELECT 'listings', COUNT(*)::int FROM vendor_listings
      UNION ALL SELECT 'categories', COUNT(*)::int FROM categories
      UNION ALL SELECT 'events', COUNT(*)::int FROM events
      UNION ALL SELECT 'moderation queue', COUNT(*)::int FROM v_moderation_queue
    `);
    console.log(`\nComplete (${baselineMode ? "baseline" : "legacy"} mode, ${dbName}).`);
    for (const row of summary.rows) console.log(`  ${row.item.padEnd(18)} ${row.n}`);
  } finally { await client.end(); }
}
main().catch((err) => {
  console.error("\nDatabase load failed.\n");
  console.error(err);
  process.exit(1);
});
