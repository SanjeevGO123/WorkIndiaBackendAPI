const express = require('express');
const pool = require('./src/config');
const routes = require('./src/routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Welcome to the Car Rental System API');
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Database connection successful:', result.rows);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
