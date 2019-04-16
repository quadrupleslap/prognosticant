import { attach, detach, text } from 'f7k/base';

export default async function loader(load, parent, loaded, failed) {
    let current;
    attach(parent, current = text('Loading…'));

    let reload = () => {
        detach(current);
        loader(load, parent, loaded, failed);
    };

    try {
        let result = await load();
        detach(current);
        attach(parent, current = loaded(reload, result));
    } catch (e) {
        console.error(e);
        detach(current);
        attach(parent, current = failed(reload));
    }
}
