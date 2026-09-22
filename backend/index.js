/**
 * Shahebbazar API server.
 *
 * Express application entry point: middleware, route mounting, health
 * check and startup diagnostics.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const { verifySchema, reportSchemaAtStartup } = require('./lib/verifySchema');

const vendorsRouter = require('./routes/vendors');
const vendorListingsRouter = require('./routes/vendorListings');
const publicRouter = require('./routes/public');
const paymentMethodsRouter = require('./routes/paymentMethods');

const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Allowed browser origins, comma-separated in CORS_ORIGIN.
 *
 * A wildcard origin is not valid for credentialed requests and would
 * expose the session cookie once authentication is added.
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serves the paths stored in listing_photos.photo_url and
// vendors.vendor_cover_url.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/vendors', vendorsRouter);
app.use('/api', vendorListingsRouter);
app.use('/api', publicRouter);
app.use('/api', paymentMethodsRouter);

/**
 * GET /api/health
 *
 * Reports connectivity and schema completeness separately. A connectivity
 * check alone returns healthy against an empty database, while every data
 * endpoint fails.
 *
 * 200 when usable, 503 otherwise.
 */
app.get('/api/health', async (req, res) => {
    let time;

    try {
        const result = await pool.query('SELECT NOW()');
        time = result.rows[0].now;
    } catch (err) {
        return res.status(503).json({
            ok: false,
            db: false,
            error: err.message,
            hint: connectionHint(err.code),
        });
    }

    const schema = await verifySchema();

    if (!schema.ok) {
        return res.status(503).json({
            ok: false,
            db: true,
            time,
            schema: { ok: false, missing: schema.missing },
            hint:
                `Database reachable but incomplete. Missing objects are defined in: ` +
                `${schema.missingFiles.join(', ')}. Run "npm run db:load" from the repository root.`,
        });
    }

    res.json({ ok: true, db: true, schema: { ok: true }, time });
});

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(`Backend running - DB Time: ${result.rows[0].now}`);
    } catch (err) {
        res.status(503).send(`Backend running - DB unreachable: ${err.message}`);
    }
});

/** Maps a PostgreSQL connection error code to a remediation message. */
function connectionHint(code) {
    switch (code) {
        case 'ECONNREFUSED':
            return 'PostgreSQL is not accepting connections. Verify the service is running.';
        case '28P01':
            return 'Authentication failed. Verify PGPASSWORD in backend/.env.';
        case '3D000':
            return 'Database does not exist. Run "npm run db:load" from the repository root.';
        default:
            return undefined;
    }
}

const server = app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    reportSchemaAtStartup();
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n  Port ${PORT} is already in use.`);
        console.error('  Stop the existing process and start again:\n');
        console.error(`    npx kill-port ${PORT}\n`);
        process.exit(1);
    }
    throw err;
});
