import SETTINGS from './storage/settings';

export function time(date) {
    let h = date.getHours(), m = date.getMinutes();
    let xm = '';

    if (!SETTINGS.get('24h')) {
        xm = h < 12 ? ' ᴀᴍ' : ' ᴘᴍ';
        h = (h + 11) % 12 + 1;
    }

    return zpad(h) + ':' + zpad(m) + xm;
}

export function relative(date) {
    let d = (Date.now() - date) / 1000 | 0;

    if (d <= 0) return 'just now';

    if (d == 1) return 'a second ago';
    if (d < 60) return d + ' seconds ago';

    d = d / 60 | 0;
    if (d == 1) return 'a minute ago';
    if (d < 60) return d + ' minutes ago';

    d = d / 60 | 0;
    if (d == 1) return 'an hour ago';
    if (d < 24) return d + ' hours ago';

    d = d / 24 | 0;
    if (d == 1) return 'yesterday';
    if (d < 7) return d + ' days ago';

    d = d / 7 | 0;
    if (d == 1) return 'last week';
    return d + ' weeks ago';
}

function zpad(x) {
    return ('00' + x).slice(-2);
}
