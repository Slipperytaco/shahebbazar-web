const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();


app.use(cors());
app.use(express.json());   // ⭐ FIXED — JSON BODY PARSER ENABLED


const vendorsRouter = require('./routes/vendors');
const vendorListingsRouter = require('./routes/vendorListings');
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
app.use('/api/vendors', vendorsRouter);
app.use('/api', vendorListingsRouter);

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.send('Backend running - DB Time: ' + result.rows[0].now);
});

app.listen(4000, () => {
    console.log('API running on http://localhost:4000');
});
