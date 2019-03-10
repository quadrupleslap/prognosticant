import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink, Router } from './router';

//TODO: Everything.

const ROUTES = {
    '/': () => <p><marquee>This is the beginning of something really excellent.</marquee></p>,
    '/timetable': () => <p>The timetable.</p>,
    '/buses': () => <p>The buses.</p>,
    '/settings': () => <p>The settings.</p>,
};

const FALLBACK = () => <p>Page not found.</p>;

const MENU = [
    ['/', 'Home'],
    ['/timetable', 'Timetable'],
    ['/buses', 'Buses'],
    ['/settings', 'Settings']
];

ReactDOM.render(
    <div>
        {
            MENU.map(([url, name]) => (
                <NavLink activeClassName='active'
                         href={url}>
                    {name + ' '}
                </NavLink>
            ))
        }
        <Router routes={ROUTES} fallback={FALLBACK} />
    </div>,
    document.getElementById('root'),
);
