const express = require('express');
const fetch = require('node-fetch');

// Environment
// ===========
// NODE_ENV      Set this to PRODUCTION in production.
// DARK_SKY_KEY  The Dark Sky API key.
// TFNSW_KEY     The Transport for NSW Open Data API key.

const PORT = process.env.PORT || 8000;

let app = express();
let static = express.static('dist', {
    setHeaders: staticHeaders,
    fallthrough: false,
});

app.get('/data/calendar', require('./calendar'));
app.get('/data/weather', require('./weather'));
app.get('/data/buses', require('./buses'));
app.get('/data/*', notFound);

app.use((req, res, next) => {
    if (req.path.includes('.')) {
        static(req, res, next);
    } else {
        next();
    }
});

app.use(index);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});

function index(req, res) {
    res.set('Cache-Control', 'public, max-age=86400');
    res.sendFile('index.html', { root: 'dist' });
}

function staticHeaders(res, path, stat) {
    res.set('Cache-Control', /\.[0-9A-Fa-f]{8}\./.test(path)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=86400');
}

function notFound(req, res) {
    res.sendStatus(404);
}
