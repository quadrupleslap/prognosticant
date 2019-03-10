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

ReactDOM.render(
    <div>
        <NavLink activeClassName='active' href='/'>Home</NavLink>
        {' '}
        <NavLink activeClassName='active' href='/timetable'>Timetable</NavLink>
        {' '}
        <NavLink activeClassName='active' href='/buses'>Buses</NavLink>
        {' '}
        <NavLink activeClassName='active' href='/settings'>Settings</NavLink>

        <Router routes={ROUTES} fallback={FALLBACK} />
    </div>,
    document.getElementById('root'),
);
