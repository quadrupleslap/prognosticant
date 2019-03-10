import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, Router } from './router';

import IoMdTimer    from 'react-icons/lib/io/android-stopwatch';
import IoMdCalendar from 'react-icons/lib/io/android-calendar';
import IoMdBus      from 'react-icons/lib/io/android-bus';
import IoMdSettings from 'react-icons/lib/io/android-settings';

//TODO: Everything.

const ROUTES = {
    '/': () => <p><marquee>This is the beginning of something really excellent.</marquee></p>,
    '/timetable': () => <p>The timetable.</p>,
    '/buses': () => <p>The buses.</p>,
    '/settings': () => <p>The settings.</p>,
};

const FALLBACK = () => <p>Page not found.</p>;

const MENU = [
    ['/', 'Home', IoMdTimer],
    ['/timetable', 'Timetable', IoMdCalendar],
    ['/buses', 'Buses', IoMdBus],
    ['/settings', 'Settings', IoMdSettings],
];

ReactDOM.render(
    <div>
        {
            MENU.map(([url, name, Icon], i) => (
                <NavLink activeClassName='active'
                         href={url}
                         key={i}>
                    <Icon />
                    {name + ' '}
                </NavLink>
            ))
        }
        <Router routes={ROUTES} fallback={FALLBACK} />
    </div>,
    document.getElementById('root'),
);
