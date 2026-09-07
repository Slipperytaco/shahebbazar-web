const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const vendorsRouter = require('./routes/vendors');
const vendorListingsRouter = require('./routes/vendorListings');

app.use(cors());
app.use(express.json());
app.use('/api/vendors', vendorsRouter);
app.use('/api', vendorListingsRouter);

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.send('Backend running - DB Time: ' + result.rows[0].now);
});

app.listen(4000, () => {
    console.log('API running on http://localhost:4000');
});

