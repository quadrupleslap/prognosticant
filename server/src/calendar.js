const fetch = require('node-fetch');

const EXPECTED_MIME = new RegExp('^text/calendar([ \t]*;|$)');
const MAX_SIZE = 1024 * 1024;

// # Parameters
//
// - url  The URL of the calendar.
//
// # Output
//
// The iCalendar document.
//
// # Errors
//
// - 400  The URL was invalid, or it didn't resolve to a calendar file.
//
module.exports = async (req, res) => {
    if (typeof req.query.url !== 'string') {
        return res.sendStatus(400);
    }

    try {
        let cres = await fetch(req.query.url, { size: MAX_SIZE });
        let mime = cres.headers.get('Content-Type');

        if (!(cres.ok && EXPECTED_MIME.test(mime))) {
            return res.sendStatus(400);
        }

        res.set('Content-Type', mime);
        return res.send(await cres.buffer());
    } catch {
        return res.sendStatus(400);
    }
};
