#!/usr/bin/env node
/**
 * Database loader.
 *
 * Creates the database if required and applies the schema and seed files
 * in order, using the connection settings in backend/.env.
 *
 *   npm run db:load     apply schema and seed
 *   npm run db:reset    drop, recreate, then apply (prompts for confirmation)
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const DATABASE_DIR = path.join(__dirname, "..", "..", "database");

/** Applied in sequence; schema files must precede the seed files they support. */
const FILES = [
    "schema.v2.sql",
    "schema.v2.1.sql",
    "seed.v2.sql",
    "seed.v2.1.sql",
    "schema.v2.2.sql",
    "seed.v2.2.sql",
    "schema.v2.3.sql",
    "seed.v2.3.sql",
];

const dbName = process.env.PGDATABASE || "shahebbazar";

const connection = {
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT) || 5432,
};

const args = process.argv.slice(2);
const wantsReset = args.includes("--reset");
const skipPrompt = args.includes("--yes") || args.includes("-y");

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

/** Runs a callback against the maintenance database, for CREATE/DROP DATABASE. */
async function withAdminClient(fn) {
    const client = new Client({ ...connection, database: "postgres" });
    await client.connect();
    try {
        return await fn(client);
    } finally {
        await client.end();
    }
}

async function main() {
    for (const file of FILES) {
        const fullPath = path.join(DATABASE_DIR, file);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Missing SQL file: ${fullPath}`);
        }
    }

    if (wantsReset && !skipPrompt) {
        const answer = await ask(
            `This drops the database "${dbName}" and all of its contents. Continue? (yes/no) `
        );
        if (answer !== "yes" && answer !== "y") {
            console.log("Cancelled. No changes made.");
            return;
        }
    }

    await withAdminClient(async (admin) => {
        if (wantsReset) {
            // Open connections prevent DROP DATABASE.
            await admin.query(
                `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
                 WHERE datname = $1 AND pid <> pg_backend_pid()`,
                [dbName]
            );
            await admin.query(`DROP DATABASE IF EXISTS "${dbName}"`);
            console.log(`Dropped database ${dbName}`);
        }

        const { rowCount } = await admin.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (rowCount === 0) {
            await admin.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Created database ${dbName}`);
        } else if (!wantsReset) {
            console.log(`Database ${dbName} exists; applying files to it`);
        }
    });

    const client = new Client({ ...connection, database: dbName });
    await client.connect();

    try {
        for (const file of FILES) {
            const sql = fs.readFileSync(path.join(DATABASE_DIR, file), "utf8");
            // Each file manages its own transaction, so one statement per file
            // is applied atomically.
            await client.query(sql);
            console.log(`  applied ${file}`);
        }

        const summary = await client.query(`
            SELECT 'businesses' AS item, COUNT(*)::int AS n FROM v_business_cards
            UNION ALL SELECT 'listings',   COUNT(*)::int FROM vendor_listings
            UNION ALL SELECT 'categories', COUNT(*)::int FROM categories
            UNION ALL SELECT 'events',     COUNT(*)::int FROM events
            UNION ALL SELECT 'moderation queue', COUNT(*)::int FROM v_moderation_queue
        `);

        console.log("\nComplete.");
        for (const row of summary.rows) {
            console.log(`  ${row.item.padEnd(18)} ${row.n}`);
        }
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error("\nDatabase load failed.\n");
    console.error(`  ${err.message}\n`);

    if (err.code === "ECONNREFUSED") {
        console.error("  PostgreSQL is not accepting connections. Verify the service is running.");
    } else if (err.code === "28P01") {
        console.error("  Authentication failed. Verify PGPASSWORD in backend/.env.");
    } else if (err.code === "42P07") {
        console.error('  Objects already exist. Use "npm run db:reset" to rebuild.');
    } else if (!fs.existsSync(path.join(__dirname, "..", ".env"))) {
        console.error("  backend/.env not found. Copy backend/.env.example to backend/.env.");
    }

    process.exit(1);
});
