import { attach, detach, html, text } from 'f7k/base';
import { listen } from 'f7k/util';
import CALENDARS from '../storage/calendars';
import SETTINGS from '../storage/settings';

export default function settings() {
    return [
        section('Settings', [
            checkbox('24h', 'Use 24-hour time'),
            checkbox('weather', 'Show the weather'),
        ]),
        section('Calendars', [
            calendars(),
            html('button.text-button', {
                child: text('Add Calendar'),
                onclick() {
                    window.alert('TODO: Add calendar.');
                },
            }),
        ]),
        section('Credits', [
            p('Developed by ', a('Ram Kaniyur', 'https://github.com/quadrupleslap'), '.'),
            p('Weather by ', a('Dark Sky', 'https://darksky.net/poweredby'), '.'),
            p('Maps by the awesome ', a('OpenStreetMap', 'https://openstreetmap.org'), ' contributors.'),
        ]),
    ];
}

function calendars() {
    let rows = {};
    let table = html('table', {});

    CALENDARS.list().then(ids => {
        for (let id of ids) {
            CALENDARS.get(id).then(data => {
                if (rows.hasOwnProperty(id)) return;
                upsertRow(data);
            });
        }
    });

    return table = html('table.settings-calendars', {
        child: [],
        destroy: listen(
            CALENDARS, 'change', e => upsertRow(e.detail),
            CALENDARS, 'delete', e => deleteRow(e.detail),
        ),
    });

    function upsertRow(data) {
        let id = data.id;

        if (!rows.hasOwnProperty(id)) {
            let node, name, color, url;

            attach(table, node = html('tr', {
                child: [
                    html('td', {
                        child: color = html('span.rounded-rectangle', {}),
                    }),
                    html('td', {
                        child: [
                            name = p(),
                            p(url = html('small', {})),
                        ],
                    }),
                    html('td', {
                        child: html('button.material-icons.icon-button', {
                            title: 'Edit',
                            child: text('edit'),
                            onclick() {
                                alert('TODO: Edit a calendar.');
                            },
                        }),
                    }),
                ],
            }));

            rows[id] = { node, name, color, url };
        }

        rows[id].name.textContent = data.name;
        rows[id].color.style.color = data.color;
        rows[id].url.textContent = data.url;
    }

    function deleteRow(id) {
        if (rows.hasOwnProperty(id)) {
            detach(rows[id].node);
            delete rows[id];
        }
    }
}

function checkbox(key, label) {
    return html('label', {
        child: [
            html('input', {
                type: 'checkbox',
                checked: SETTINGS.get(key),
                onchange() {
                    SETTINGS.set(key, this.checked);
                },
            }),
            text(' ' + label),
        ],
    });
}

function section(title, child) {
    return html('section.letterbox', {
        child: [
            html('h2', { child: text(title) }),
            child,
        ],
    });
}

function p(...xs) {
    let child = xs.map(x => typeof x == 'string' ? text(x) : x);
    return html('p', { child });
}

function a(s, href) {
    return html('a', { href, child: text(s), target: '_blank' });
}
