/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const config = require('./config');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

// API key verification middleware
app.use((req, res, next) => {
    const apiKeyHeader = req.headers['api-key'];

    if (apiKeyHeader !== config.API_KEY) {
        return res.status(401).json({ error: ' Unauthorized! Invalid API key ' });
    }

    // If the API key is valid, go to the next middleware
    return next();
});

// All routes de l'app
app.use('/api/', apiRoutes);

// Fallback route
app.use((req, res) => {
    res.status(404);
});
