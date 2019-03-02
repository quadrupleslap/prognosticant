const express = require('express');
const fetch = require('node-fetch');

const PORT = 8000;

let app = express();

// Environment
// ===========
// NODE_ENV      Set this to PRODUCTION in production.
// DARK_SKY_KEY  The Dark Sky API key.
// TFNSW_KEY     The Transport for NSW Open Data API key.

app.get('/data/calendar', require('./calendar'));
app.get('/data/weather', require('./weather'));
app.get('/data/buses', require('./buses'));
app.use(express.static('static'));
app.use((req, res) => res.sendFile('index.html', { root: 'static' }));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});
