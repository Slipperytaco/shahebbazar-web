#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const args = process.argv.slice(2);
const databaseArg = args.find((arg) => arg.startsWith("--database="));
const dbName = databaseArg ? databaseArg.slice("--database=".length) : process.env.PGDATABASE;
const sqlPath = path.join(__dirname, "..", "..", "database", "checks", "verify-baseline.sql");

async function main() {
  if (!dbName) throw new Error("No database selected. Set PGDATABASE or pass --database=name.");
  const client = new Client({
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT) || 5432,
    database: dbName,
  });
  await client.connect();
  try {
    const result = await client.query(fs.readFileSync(sqlPath, "utf8").replace(/^\uFEFF/, ""));
    if (result.rowCount) {
      console.error("Database verification failed:");
      console.table(result.rows);
      process.exitCode = 1;
    } else {
      console.log(`Database verification passed for ${dbName}.`);
    }
  } finally { await client.end(); }
}
main().catch((err) => { console.error(err); process.exit(1); });
