const fetch = require('node-fetch');
const Cached = require('./cached');

const { TFNSW_KEY, TFNSW_CENTRAL_ID, TFNSW_UNSW_ID } = require('./constants');

const makeURL = (src, dst) => `
https://api.transport.nsw.gov.au/v1/tp/trip
?outputFormat=rapidJSON
&version=10.2.1.42
&coordOutputFormat=EPSG%3A4326
&calcNumberOfTrips=16

&type_origin=any
&type_destination=any
&name_origin=${encodeURIComponent(src)}
&name_destination=${encodeURIComponent(dst)}

&excludedMeans=checkbox
&exclMOT_1=1
&exclMOT_4=1
&exclMOT_7=1
&exclMOT_9=1
&exclMOT_11=1
`.replace(/\n/g, '');

const HEADERS = { 'Authorization': `apikey ${TFNSW_KEY}` };

const makeCache = url => new Cached(60, async () => {
    let cres = await fetch(url, { headers: HEADERS });

    if (!cres.ok) {
        throw new Error('bad response from Transport for NSW');
    }

    let data = await cres.json();
    let result = [];

    for (let j of data.journeys) {
        let legs = [];

        for (let l of j.legs) {
            let departure = Date.parse(l.origin.departureTimeEstimated) / 1000 | 0;
            let arrival = Date.parse(l.destination.arrivalTimeEstimated) / 1000 | 0;

            const getName = x => x.parent.disassembledName || x.name;

            let source = {
                name: getName(l.origin),
                coords: l.origin.coord,
            };
            let destination = {
                name: getName(l.destination),
                coords: l.destination.coord,
            };

            let transport;
            if (l.transportation.product.class == 5) {
                transport = {
                    kind: 'bus',
                    name: l.transportation.disassembledName,
                    description: l.transportation.description,
                }
            } else {
                transport = { kind: 'walk' };
            }

            legs.push({
                departure,
                arrival,
                source,
                destination,
                path: l.coords,
                transport,
            });
        }

        result.push({ legs });
    }

    return result;
});

let fromCentral = makeCache(makeURL(TFNSW_CENTRAL_ID, TFNSW_UNSW_ID));
let fromUNSW    = makeCache(makeURL(TFNSW_UNSW_ID, TFNSW_CENTRAL_ID));

// # Parameters
//
// - from  Either `central` or `unsw`.
//
// # Output
//
// ```
// [{
//     legs: [{
//         departure: number,    The estimated departure time (a UNIX timestamp).
//         arrival: number,      The estimated arrival time (a UNIX timestamp).
//         source: Place,        The source.
//         destination: Place,   The destination.
//         path: [[number; 2]],  A bunch of points on the path, in order.
//
//         transport: {
//             kind: 'walk'
//         } | {
//             kind: 'bus',
//             name: string,         A very short name for the route.
//             description: string,  A one-line description of the route.
//         },
//     }]
// }]
//
// Place {
//     name: string,         The place's name.
//     coords: [number; 2],  The place's latitude and longitude.
// }
// ```
//
// # Errors
//
// - 400  `from` was either invalid or not provided.
// - 500  We couldn't load the data.
//
module.exports = async (req, res) => {
    if (typeof req.query.from !== 'string') {
        return res.sendStatus(400);
    }

    switch (req.query.from) {
        case 'central': return fromCentral.serve(req, res);
        case 'unsw': v = 1; return fromUNSW.serve(req, res);
        default: return res.sendStatus(400);
    }
};
