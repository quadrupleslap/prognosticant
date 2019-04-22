import { html, text } from 'f7k/base';
import { navigate, link } from 'f7k/router';
import CALENDARS from '../storage/calendars';
import SETTINGS from '../storage/settings';
import ICAL from 'ical.js';
import * as fmt from '../fmt';
import eventDetails from './event-details';
import loader from '../components/loader';
import cat from '../components/cat';

export default function today() {
    let current;
    let container = html('.center', {});
    loader(load, container, loaded, failed);
    return container;
}

async function load() {
    let events = {};
    let ids = await CALENDARS.list();

    await Promise.all(ids.map(async id => {
        let cal = await CALENDARS.get(id);
        if (events.hasOwnProperty(cal.id)) return;
        events[cal.id] = extractEvents(cal.data);
    }));

    return events;
}

function loaded(reload, events) {
    let now = ICAL.Time.now();
    let nowday = ymd(now);
    let ids = Object.keys(events);

    if (ids.length == 0) {
        navigate('/about');
        return null;
    }

    let day = null;
    let plan = [];

    for (let id of ids) {
    for (let event of events[id]) {
        let times = [];
        let myday = null;
        let good = false; // A day is good iff it has an event that isn't over.

        if (event.isRecurring()) {
            let it = event.iterator();
            let time;
            while ((time = it.next())) {
                let det = event.getOccurrenceDetails(time);

                let d = ymd(det.startDate);
                if (d < nowday) continue;

                if (myday) {
                    if (d != myday) {
                        if (good) {
                            break;
                        } else {
                            myday = d;
                            times = [];
                        }
                    }
                } else {
                    myday = d;
                }

                if (now.compare(det.endDate) < 0) {
                    good = true;
                }

                times.push({
                    event: det.item,
                    start: det.startDate,
                    end: det.endDate,
                });
            }
        } else {
            myday = ymd(event.startDate);
            if (myday < nowday) continue;

            if (now.compare(event.endDate) < 0) {
                good = true;
            }

            times.push({
                event,
                start: event.startDate,
                end: event.endDate,
            });
        }

        if (!good) continue;

        if (!day || myday < day) {
            day = myday;
            plan = times;
        } else if (myday == day) {
            for (let p of times) {
                plan.push(p);
            }
        }
    }}

    if (!day) {
        return [
            html('p', { child: text('Your calendars are empty!') }),
            html('iframe', {
                src: 'https://bandcamp.com/EmbeddedPlayer/album=1612699229/size=small/bgcol=ffffff/linkcol=0687f5/track=2324223008/transparent=true/',
                style: 'border: 0; width: 320px; height: 42px;',
            }),
        ];
    }

    plan.sort((a, b) => a.start.compare(b.start));
    return ultimate(reload, plan);
}

function ultimate(reload, plan) {
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
                $in = cat('small', ' in'),
            ],
            destroy() {
                clearInterval(ticki);
            },
        }),

        $countdown = html('h1.big', {
            child: text('__:__:__'),
        }),

        $weather = html('span.today-weather', {}),

        html('ol.letterbox.today-events', {
            child: plan.map(({ event, start, end }) => {
                return html('li.today-event', {
                    child: [
                        cat('span', event.summary),
                        cat('small', fmt.interval(start.toJSDate(), end.toJSDate())),
                        cat('small', event.location),
                    ],
                    onclick: () => eventDetails(event),
                });
            }),
        }),
    ];

    $weather.style.display = 'none';
    if (SETTINGS.get('weather')) {
        fetch('/data/weather').then(async res => {
            if (!res.ok) return;
            res = await res.json();

            let time = plan[0].start.toJSDate() / 1000;
            for (let w of res) {
                if (w.time > time || time > w.time + 86400) continue;

                let p = Math.round(w.probability * 100);
                let f;

                if (p < 10) {
                    break;
                } else if (p < 30) {
                    f = 'Slight';
                } else if (p < 60) {
                    f = 'Medium';
                } else if (p < 80) {
                    f = 'High'
                } else {
                    f = 'Very high';
                }

                $weather.textContent = `☂ ${p}% · ${f} chance of ${w.kind}.`;
                $weather.style.display = '';

                break;
            }
        });
    }

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

                $countdown.textContent = `${fmt.zpad(delta)}:${fmt.zpad(mm)}:${fmt.zpad(ss)}`;
                $next.textContent = name;
                $in.textContent = end ? ' ends in' : ' in';

                return;
            }
        }

        reload();
    }
}

function failed(reload) {
    return cat('span', 'Something went wrong. ', html('a', {
        href: '#',
        child: text('Try again?'),
        onclick: e => {
            e.preventDefault();
            reload();
        },
    }));
}

function ymd(time) {
    return `${time.year}-${fmt.zpad(time.month)}-${fmt.zpad(time.day)}`;
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
