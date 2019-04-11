import CALENDARS from '../storage/calendars';
import colorPicker from '../components/color-picker';
import modal from 'f7k/modal';
import toast from '../components/toast';
import { html, text } from 'f7k/base';

export async function addCalendar() {
    base('New Calendar', 'Add', { name: 'UNSW Timetable' }, async function () {
        let cal = {
            name: this.elements.name.value,
            color: this.elements.color.value,
            url: this.elements.url.value,
        };

        await CALENDARS.add(cal);
        await CALENDARS
            .load(cal.id)
            .then(() => toast.success(`Loaded "${cal.name}".`))
            .catch(() => toast.warn(`Couldn't load "${cal.name}". Maybe the URL's wrong?`));
    }, () => null);
}

export async function editCalendar(id) {
    let oldCal = await CALENDARS.get(id);

    base(`Edit "${oldCal.name}"`, 'Save', oldCal, async function () {
        let cal = {
            name: this.elements.name.value,
            color: this.elements.color.value,
            url: this.elements.url.value,
        };

        await CALENDARS.update(id, cal);

        if (oldCal.url !== cal.url) {
            await CALENDARS
                .load(id)
                .then(() => toast.success(`Reloaded "${cal.name}".`))
                .catch(() => toast.warn(`Couldn't reload "${cal.name}". Maybe the URL's wrong?`));
        }
    }, close => [
        html('button.text-button.danger', {
            type: 'button',
            child: text('Delete Timetable'),
            onclick() {
                if (confirm(`Delete the timetable "${oldCal.name}"?`)) {
                    close();
                    CALENDARS
                        .remove(id)
                        .then(() => toast.success(`Deleted "${oldCal.name}".`))
                        .catch(() => toast.error(`Couldn't delete "${oldCal.name}".`));
                }
            },
        }),
    ]);
}

function base(title, action, initial, func, rest) {
    let autofocus, submit, submitting = false;

    modal('modal', close => {
        return html('form', {
            child: [
                html('header.header', {
                    child: [
                        html('button.icon-button.material-icons', {
                            type: 'button',
                            child: text('close'),
                            onclick: close,
                        }),
                        html('h2', { child: text(title) }),
                        submit = html('button.text-button', { child: text(action) }),
                    ],
                }),

                html('', {
                    child: [
                        html('a', {
                            href: 'https://my.unsw.edu.au/utils/pttx/reset.xml',
                            rel: 'noreferrer',
                            target: '_blank',
                            child: text('Click here'),
                        }),
                        text(' to get your UNSW timetable\'s URL.'),
                    ],
                }),

                label('Name', autofocus = html('input.text-input', {
                    name: 'name',
                    type: 'text',
                    required: true,
                    placeholder: 'UNSW Timetable',
                    value: initial.name,
                })),

                label('URL', html('input.text-input', {
                    name: 'url',
                    type: 'url',
                    required: true,
                    placeholder: 'webcal://',
                    value: initial.url,
                })),

                html('fieldset.label', {
                    child: [
                        html('legend', { child: text('Color') }),
                        colorPicker('color', initial.color),
                    ],
                }),

                rest(close),
            ],
            async onsubmit(e) {
                e.preventDefault();
                if (submitting) return;

                submitting = true;
                submit.disabled = true;

                try {
                    await func.call(this);
                    close();
                } catch (e) {
                    toast.error(e.message + '.');
                } finally {
                    submit.disabled = false;
                    submitting = false;
                }
            },
        });
    });

    autofocus.focus();
}

function label(label, child) {
    return html('label.label', { child: [text(label), child] });
}
