const express = require('express');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 8000;

let app = express();

// Environment
// ===========
// NODE_ENV      Set this to PRODUCTION in production.
// DARK_SKY_KEY  The Dark Sky API key.
// TFNSW_KEY     The Transport for NSW Open Data API key.

app.get('/data/calendar', require('./calendar'));
app.get('/data/weather', require('./weather'));
app.get('/data/buses', require('./buses'));

function index(req, res) {
    res.set('Cache-Control', 'no-cache');
    res.sendFile('index.html', { root: 'dist' });
}

function staticHeaders(res, path, stat) {
    res.set('Cache-Control', path.endsWith('.html')
        ? 'no-cache'
        : 'public,max-age=31536000,immutable');
}

app.use(express.static('dist', { setHeaders: staticHeaders }));
app.use(index);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});
