const fetch = require('node-fetch');
const Cached = require('./cached');

const { DARK_SKY_KEY, UNSW_LAT, UNSW_LON } = require('./constants');

const URL = `https://api.darksky.net/forecast/${DARK_SKY_KEY}/${UNSW_LAT},${UNSW_LON}?units=si&exclude=currently,minutely,daily,alerts,flags`;

let weather = new Cached(5 * 60, async () => {
    let cres = await fetch(URL);

    if (!cres.ok) {
        throw new Error('bad response from Dark Sky');
    }

    let data = await cres.json();
    let result = [];

    for (let d of data.hourly.data) {
        result.push({
            time: d.time,
            summary: d.summary,
            kind: d.precipType || undefined,
            intensity: d.precipIntensity || undefined,
            probability: d.precipProbability || undefined
        });
    }

    return result;
});


// # Parameters
//
// None.
//
// # Output
//
// ```
// [{
//     time: number,                     UNIX timestamp of the start of the hour.
//     summary: string,                  Human-readable and contextualized summary.
//     kind: string | undefined,         The precipitation type (rain, snow, sleet, etc.).
//     intensity: number | undefined,    The millimetres of precipitation per hour.
//     probability: number | undefined,  The probability that there is any precipitation.
// }]
// ```
//
// # Errors
//
// - 500  We couldn't load the data.
//
module.exports = (req, res) => weather.serve(req, res);
