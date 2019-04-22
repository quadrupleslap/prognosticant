import { text } from 'f7k/base';
import { link } from 'f7k/router';
import cat from '../components/cat';

export default function about() {
    return cat('.center',
        cat('h1.big', 'Quartz'),
        cat('p', 'Convenient stuff for UNSW students.'),
        cat('section.normal.letterbox',
            cat('h2', 'Get Started'),
            cat('p',
                'Head over to ',
                link({ href: '/settings', child: text('the settings') }),
                ' and add your UNSW timetable.',
            ),
        ),
        cat('section.normal.letterbox',
            cat('h2', 'Features'),
            cat('p', 'You get…'),
            cat('ul',
                cat('li', 'a countdown to your next class.'),
                cat('li', 'a list of classes for the day.'),
                cat('li', 'your class timetable.'),
                cat('li', 'a list of the upcoming buses.'),
            ),
        ),
        cat('section.normal.letterbox',
            cat('h2', 'Security'),
            cat('p', `
                We never see your username or password. Our computers do see
                your timetable, but we won't do anything with it other than hand
                it over to your computer.
            `),
        ),
    );
}
