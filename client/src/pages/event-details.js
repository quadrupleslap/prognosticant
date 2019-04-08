import modal from 'f7k/modal';
import { html, text } from 'f7k/base';

//TODO: Massive refactor here, too.
//TODO: Consider adding an inline map.

export default function eventDetails(event) {
    modal('modal', close => {
        let body = [
            html('header.modal-header', {
                child: [
                    html('button.icon-button.material-icons', {
                        type: 'button',
                        child: text('close'),
                        onclick: close,
                    }),
                    html('h2', { child: text(event.summary) }),
                ],
            }),

            //TODO: Styling, i.e. align icons and text and allow for long text.
        ];

        if (event.description) {
            body.push(detail('subject', event.description));
        }

        if (event.location) {
            let msg = event.location;
            let geo = event.component.getFirstPropertyValue('geo');

            if (Array.isArray(geo) && geo.length == 2) {
                msg = html('a', {
                    child: text(msg),
                    href: 'https://www.google.com/maps/dir/?api=1&destination=' + geo.map(encodeURIComponent).join(','),
                    target: '_blank',
                });
            }

            console.log(geo);

            body.push(detail('place', msg));
        }

        let parent = event.component.parent;
        if (parent) {
            let calname = parent.getFirstPropertyValue('x-wr-calname');
            if (calname) body.push(detail('today', calname));
        }

        return body;
    });
}

function detail(icon, msg) {
    return html('p', {
        child: [
            html('i.material-icons', { child: text(icon) }),
            text(' '),
            typeof msg === 'string' ? text(msg) : msg,
        ],
    });
}
