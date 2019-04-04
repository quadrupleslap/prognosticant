import { attach, detach, html, text } from 'f7k/base';

const DURATION = 3000;
const LEVELS = {};
const TOASTS = html('', {});

attach(document.body, TOASTS);

let start = true;

function enqueue(level, msg) {
    let toast = html('.toast.' + level, { child: text(msg) });
    attach(TOASTS, toast);
    toast.offsetWidth;

    if (start) {
        start = false;
        show(toast);
    }
}

function hide(toast) {
    let next = toast.nextSibling;

    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => detach(toast), 1000);

    if (next) {
        show(next);
    } else {
        start = true;
    }
}

function show(toast) {
    toast.classList.add('toast-show');
    setTimeout(() => hide(toast), DURATION);
}

for (let level of ['info', 'success', 'warn', 'error']) {
    LEVELS[level] = (...args) => enqueue(level, ...args);
}

export default LEVELS;
