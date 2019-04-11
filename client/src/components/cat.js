import { html, text } from 'f7k/base';

export default function cat(tag, ...args) {
    return html(tag, { child: args.map(x => typeof x == 'string' ? text(x) : x) });
}
