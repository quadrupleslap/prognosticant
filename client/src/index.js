import { attach, html, text } from 'f7k/base';
import { navlink, router } from 'f7k/router';

import today from './pages/today';
import buses from './pages/buses';
import settings from './pages/settings';

const routes = {
    '/': today,
    '/timetable': () => text('TODO: Timetable.'),
    '/buses': buses,
    '/settings': settings,
};

const fallback = () => text('Page not found.');

const menu = [
    ['/', 'Today', 'timer'],
    ['/timetable', 'Timetable', 'event_note'],
    ['/buses', 'Buses', 'directions_bus'],
    ['/settings', 'Settings', 'settings']
];

attach(document.body, [
    html('nav#navbar', {
        child: menu.map(([href, title, ic]) => navlink({
            active: { className: 'active' },
            title,
            href,
            child: [
                html('span.material-icons.nav-icon', { child: text(ic) }),
                html('span.nav-label', { child: text(title) }),
            ],
        })),
    }),
    html('main#main', {
        child: router(routes, fallback),
    }),
]);
