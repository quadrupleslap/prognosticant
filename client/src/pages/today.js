import { attach, detach, html, text } from 'f7k/base';
import { link } from 'f7k/router';
import { listen } from 'f7k/util';
import CALENDARS from '../storage/calendars';
import ICAL from 'ical.js';
import * as date from '../date';
import eventDetails from './event-details';

//TODO: Refactor the entire application, is what I'm saying.

export default function today() {
    let current;
    let container = html('.today', {});

    //TODO: Make the calendar change event check that something actually changed.
    //TODO: Listen for calendar change and delete events and reload the timetable.
    //TODO: Make the 'add your first calendar' link open the dialog directly.

    (async () => {
        attach(container, current = text('Loading…'));

        try {
            let events = {};
            let ids = await CALENDARS.list();

            await Promise.all(ids.map(async id => {
                let cal = await CALENDARS.get(id);
                if (events.hasOwnProperty(cal.id)) return;
                if (!cal.data) return;
                events[cal.id] = extractEvents(cal.data);
            }));

            while (true) {
                await new Promise(reload => {
                    detach(current);
                    attach(container, current = loaded(reload, events));
                });
            }
        } catch (e) {
            console.error(e);
            detach(current);
            attach(container, current = failed());
        }
    })();

    return container;
}

function loaded(reload, events) {
    let now = ICAL.Time.now();
    let ids = Object.keys(events);

    if (ids.length == 0) {
        //TODO: This is a good spot for a logo.
        return link({
            href: '/settings',
            child: text('Add your first calendar!'),
        });
    }

    let day = null;
    let plan = [];

    for (let id of ids) {
    for (let event of events[id]) {
        let times = [];
        let myday;

        if (event.isRecurring()) {
            let it = event.iterator();
            let time;
            while ((time = it.next())) {
                let det = event.getOccurrenceDetails(time);

                if (now.compare(det.startDate) == 1) continue;

                if (myday) {
                    if (ymd(det.startDate) != myday) break;
                } else {
                    myday = ymd(det.startDate);
                }

                times.push({
                    event: det.item,
                    start: det.startDate,
                    end: det.endDate,
                });
            }
        } else {
            let time = event.startDate;
            if (now.compare(time) == 1) continue;
            myday = ymd(time);
            times.push({
                event,
                start: event.startDate,
                end: event.endDate,
            });
        }

        if (!times.length) continue;

        if (!day || myday < day) {
            day = myday;
            plan = [];
        } else if (myday != day) {
            continue;
        }

        for (let p of times) {
            plan.push(p);
        }
    }}

    if (!day) {
        //TODO: This is a good spot for something stupid.
        return text('But nobody came.');
    }

    plan.sort((a, b) => a.start.compare(b.start));
    return ultimate(reload, plan);
}

function ultimate(reload, plan) {
    //TODO: Naming convention?
    let $next, $in, $countdown, $weather, ticki;

    let stages = [];
    for (let { event, start, end } of plan) {
        stages.push({
            name: event.summary,
            time: +start.toJSDate(),
            end: false,
        });
        stages.push({
            name: event.summary,
            time: +end.toJSDate(),
            end: true,
        });
    }
    stages.sort((a, b) => a.time - b.time || a.end - b.end);

    let result = [
        html('h2.today-next', {
            child: [
                $next = text('Class Name'),
                $in = txt('small', ' in'),
            ],
            destroy: () => clearInterval(ticki),
        }),

        $countdown = html('h1.today-countdown', {
            child: text('__:__:__'),
        }),

        $weather = html('span.today-weather', {}),

        html('ol.letterbox.today-events', {
            child: plan.map(({ event, start, end }) => {
                return html('li.today-event', {
                    child: [
                        txt('span', event.summary),
                        txt('small', `${date.time(start.toJSDate())} – ${date.time(end.toJSDate())}`),
                        txt('small', event.location),
                    ],
                    onclick: () => eventDetails(event),
                });
            }),
        }),
    ];

    $weather.style.display = 'none';
    //TODO(urgent): Weather.

    ticki = setInterval(tick, 1000);
    tick();

    return result;

    function tick() {
        let now = Date.now();

        for (let { name, time, end } of stages) {
            if (now <= time) {
                let delta = (time - now) / 1000 | 0;
                let ss = delta % 60;
                delta = delta / 60 | 0;
                let mm = delta % 60;
                delta = delta / 60 | 0;

                $countdown.textContent = `${zpad2(delta)}:${zpad2(mm)}:${zpad2(ss)}`;
                $next.textContent = name;
                $in.textContent = end ? ' ends in' : ' in';

                return;
            }
        }

        reload();
    }
}

function failed() {
    return txt('span', 'Something went wrong. ', link({
        href: '/',
        child: text('Try again?'),
    }));
}

function ymd(time) {
    return `${time.year}-${zpad2(time.month)}-${zpad2(time.day)}`;
}

function zpad2(s) {
    return s.toString().padStart(2, '0');
}

function extractEvents(cals) {
    let events = [];

    for (let cal of cals) {
        let vcal = new ICAL.Component(cal);
        let vevents = vcal.getAllSubcomponents('vevent');
        for (let vevent of vevents) events.push(new ICAL.Event(vevent));
    }

    return events;
}

function txt(tag, ...args) {
    return html(tag, {
        child: args.map(x => typeof x == 'string' ? text(x) : x)
    });
}
