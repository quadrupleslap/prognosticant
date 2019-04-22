import { attach, detach, html, text } from 'f7k/base';
import { navigate, link } from 'f7k/router';
import CALENDARS from '../storage/calendars';
import SETTINGS from '../storage/settings';
import ICAL from 'ical.js';
import * as fmt from '../fmt';
import eventDetails from './event-details';
import loader from '../components/loader';
import cat from '../components/cat';

//TODO: Clash handling.
//TODO: Neither this nor today handles all-day events as far as I know.
//TODO: Events that span multiple days.

const CELL_HEIGHT = 48;

export default function today() {
    let current;
    let container = html('.timetable', {});
    loader(load, container, loaded, failed);
    return container;
}

async function load() {
    let events = {};
    let ids = await CALENDARS.list();

    await Promise.all(ids.map(async id => {
        let cal = await CALENDARS.get(id);
        if (events.hasOwnProperty(cal.id)) return;
        events[cal.id] = {
            color: cal.color,
            events: extractEvents(cal.data),
        };
    }));

    return events;
}

function loaded(reload, es) {
    if (Object.keys(es).length == 0) {
        navigate('/about');
        return null;
    }

    let sunday = startOfLastSunday();
    let $title, $timetable, $head, $body, $content;

    function dateChanged() {
        let saturday = new Date(+sunday);
        saturday.setDate(saturday.getDate() + 6);

        let m1 = getMonth(sunday);
        let m2 = getMonth(saturday);
        let y1 = sunday.getFullYear();
        let y2 = saturday.getFullYear();

        if (y1 == y2) {
            if (m1 == m2) {
                $title.textContent = `${m1} ${y1}`;
            } else {
                $title.textContent = `${m1} – ${m2} ${y1}`;
            }
        } else {
            $title.textContent = `${m1} ${y1} – ${m2} ${y2}`;
        }

        let days = getEvents(es, sunday);

        //TODO: ! Swipey gestures (after which you can hide < and > on touch screens).

        detach($head);
        detach($content);

        $head = getHead(days);
        $content = getContent(days);

        attach($timetable, $head, $body);
        attach($body, $content);
    }

    let $res = [
        cat('header.header',
            html('button.icon-button.material-icons', {
                child: text('chevron_left'),
                title: 'Previous Week',
                onclick() {
                    sunday.setDate(sunday.getDate() - 7);
                    dateChanged();
                },
            }),
            html('button.icon-button.material-icons', {
                child: text('chevron_right'),
                title: 'Next Week',
                onclick() {
                    sunday.setDate(sunday.getDate() + 7);
                    dateChanged();
                },
            }),
            $title = cat('h2', '😏'),
            html('button.icon-button.material-icons', {
                child: text('today'),
                title: 'Today',
                onclick() {
                    sunday = startOfLastSunday();
                    dateChanged();
                },
            }),
        ),
        $timetable = html('.timetable-timetable', {
            child: [
                // Head goes here.
                $body = html('.timetable-body', {
                    child: [
                        getTimes(),
                        // Content goes here.
                    ],
                }),
            ],
        }),
    ];

    dateChanged();

    return $res;
}

function getHead(days) {
    let today = ymd(new Date()); //TODO: Update the indicator, live.

    return html('.timetable-head', {
        child: days.map(({ date, events }) => {
            return cat(
                ymd(date) == today ? '.timetable-active' : '',
                date.toLocaleString('en-us', {
                    weekday: 'narrow',
                    day: 'numeric',
                }),
            );
        }),
    });
}

function getTimes() {
    let times = [];

    for (let i = 1; i <= 23; i++) {
        times.push(cat('small', fmt.time(i)));
    }

    return html('.timetable-times', { child: times });
}

function getContent(days) {
    return html('.timetable-content', {
        child: days.map(({ events }) => {
            return html('.timetable-column', {
                child: events.map(({ color, event }) => {
                    let x = html('div.timetable-event', {
                        onclick() {
                            eventDetails(event);
                        },
                        child: text(event.summary),
                    });

                    let a = event.startDate.hour * 60 + event.startDate.minute;
                    let b = event.endDate.hour * 60 + event.endDate.minute;
                    if (a == b) b += 30;


                    x.style.top = (a / 14.4) + '%';
                    x.style.bottom = (100 - b / 14.4) + '%';
                    x.style.backgroundColor = color;

                    return x;
                }),
            });
        }),
    });
}

function getMonth(d) {
    return d.toLocaleString('en-us', { month: 'long' });
}

function startOfLastSunday() {
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function ymd(time) {
    return `${time.getFullYear()}-${fmt.zpad(time.getMonth() + 1)}-${fmt.zpad(time.getDate())}`;
}

function failed(reload) {
    return cat('div.center', 'Something went wrong. ', html('a', {
        href: '#',
        child: text('Try again?'),
        onclick: e => {
            e.preventDefault();
            reload();
        },
    }));
}

function getEvents(events, sunday) {
    let end = new Date(+sunday);
    let res = [];

    for (let i = 0; i < 7; i++) {
        res.push({
            date: new Date(+end),
            events: [],
        });
        end.setDate(end.getDate() + 1);
    }

    for (let id in events) {
    for (let event of events[id].events) {
        if (event.isRecurring()) {
            let it = event.iterator();
            let time;
            while ((time = it.next())) {
                let det = event.getOccurrenceDetails(time);

                let d = det.startDate.toJSDate();
                if (d < sunday) continue;
                if (end < d) break;

                res[d.getDay()].events.push({
                    color: events[id].color,
                    start: det.startDate,
                    end: det.endDate,
                    event: det.item,
                });
            }
        } else {
            let d = event.startDate.toJSDate();

            if (sunday <= d && d < end) {
                res[d.getDay()].events.push({
                    color: events[id].color,
                    start: event.startDate,
                    end: event.endDate,
                    event,
                });
            }
        }
    }}

    for (let i = 0; i < 7; i++) {
        res[i].events.sort((a, b) => a.start.compare(b.start));
    }

    if (res[0].events.length == 0 && res[6].events.length == 0) {
        res.pop();
        res.shift();
    }

    return res;
}

function extractEvents(cals) {
    let events = [];

    if (cals) {
        for (let cal of cals) {
            let vcal = new ICAL.Component(cal);
            let vevents = vcal.getAllSubcomponents('vevent');
            for (let vevent of vevents) events.push(new ICAL.Event(vevent));
        }
    }

    return events;
}
