import { html, text } from 'f7k/base';
import modal from 'f7k/modal';
import colorPicker from '../components/color-picker';
import CALENDARS from '../storage/calendars';

//TODO: Clean this up.

export async function addCalendar() {
    base('New Calendar', 'Add', {}, async function () {
        let cal = {
            name: this.elements.name.value,
            color: this.elements.color.value,
            url: this.elements.url.value,
        };

        await CALENDARS.add(cal);

        CALENDARS.load(cal.id).catch(e => {
            //TODO: Warn the user that it wasn't loaded correctly.
            console.warn(e);
        });
    }, () => null);
}

export async function editCalendar(id) {
    let oldCal;
    try {
        oldCal = await CALENDARS.get(id);
    } catch (e) {
        //TODO: Notify the user of the error.
        console.error(e);
        return;
    }

    base(`Edit "${oldCal.name}"`, 'Save', oldCal, async function () {
        let cal = {
            name: this.elements.name.value,
            color: this.elements.color.value,
            url: this.elements.url.value,
        };

        await CALENDARS.update(id, cal);

        if (oldCal.url !== cal.url) {
            CALENDARS.load(id).catch(e => {
                //TODO: Warn the user that it wasn't loaded correctly.
                console.warn(e);
            });
        }
    }, close => [
        html('button.text-button.danger', {
            type: 'button',
            child: text('Delete Timetable'),
            onclick() {
                if (confirm(`Delete the timetable "${oldCal.name}"?`)) {
                    close();
                    CALENDARS.remove(id).catch(e => {
                        //TODO: Notify the user that the timetable wasn't deleted.
                        console.error(e);
                    });
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
                html('header.modal-header', {
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
                    //TODO: Notify the user of the error.
                    console.error(e);
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
