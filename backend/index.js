const express = require('express');
const pool = require('./db');
const app = express();
const vendorsRouter = require('./routes/vendors');

app.use(express.json());
app.use('/api/vendors', vendorsRouter);

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.send('Backend running - DB Time: ' + result.rows[0].now);
});

app.listen(4000, () => {
    console.log('API running on http://localhost:4000');
});

