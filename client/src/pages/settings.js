import { html, text } from 'f7k/base';
import SETTINGS from '../storage/settings';

export default function settings() {
    return [
        section('Settings', [
            checkbox('24h', 'Use 24-hour time'),
            checkbox('weather', 'Show the weather'),
        ]),
        section('Calendars', [
            p('TODO: Calendars.'),
        ]),
        section('Credits', [
            p('Developed by ', a('Ram Kaniyur', 'https://github.com/quadrupleslap'), '.'),
            p('Weather by ', a('Dark Sky', 'https://darksky.net/poweredby'), '.'),
            p('Maps by the awesome ', a('OpenStreetMap', 'https://openstreetmap.org'), ' contributors.'),
        ]),
    ];
}

function checkbox(key, label) {
    let box;

    SETTINGS.get(key).then(val => {
        box.checked = val;
        box.disabled = false;
    });

    return html('label', {
        child: [
            box = html('input', {
                type: 'checkbox',
                disabled: true,
                onchange: () => {
                    SETTINGS.set(key, box.checked);
                },
            }),
            text(label),
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
