import { attach, detach, text } from 'f7k/base';

export default async function loader(load, parent, loaded, failed) {
    let current;
    while (true) {
        detach(current);
        attach(parent, current = text('Loading…'));
        try {
            let result = await load();
            await new Promise(reload => {
                detach(current);
                attach(parent, current = loaded(reload, result));
            });
        } catch (e) {
            console.error(e);
            await new Promise(reload => {
                detach(current);
                attach(parent, current = failed(reload));
            });
        }
    }
}
