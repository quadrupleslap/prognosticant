//TODO: Remove this dependency when Apple stop being so bad.
import EventTarget from '@ungap/event-target';
import ICAL from 'ical.js';

// Calendar {
//     id:      number, // Automatically generated.
//     name:    string,
//     color:   string,
//     url:     string,
//     fetched: number, // Date.now() at the time of fetch.
//     data:    [jcal], // Undefined if not fetched.
// }

class Calendars extends EventTarget {
    constructor(name) {
        super();

        this.name = name;
        this.db = new Promise((resolve, reject) => {
            let req = indexedDB.open(name);

            req.onerror = e => reject(req.error);
            req.onsuccess = e => resolve(req.result);

            req.onupgradeneeded = e => {
                let db = req.result;
                db.createObjectStore(name, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
            };
        });

        this.list().then(ids => {
            for (let id of ids) {
                this.load(id);
            }
        });
    }

    // Add the given calendar.
    //
    // - The same object is returned.
    // - The object's ID is set.
    // - The calendar is not loaded.
    async add(cal) {
        await this._transaction(true, store => {
            let req = store.add(cal);
            req.onsuccess = e => cal.id = req.result;
        });

        this._change(cal);
        return cal;
    }

    // Get a calendar.
    async get(id) {
        let cal;

        await this._transaction(false, store => {
            let req = store.get(id);
            req.onsuccess = e => cal = req.result;
        });

        if (cal == null) throw new Error('Calendar not found');
        return cal;
    }

    // Load / reload the calendar.
    async load(id) {
        let v1 = await this.get(id);

        let res = await fetch('/data/calendar?url=' + encodeURIComponent(v1.url));
        if (!res.ok) throw new Error(res.statusText);
        let text = await res.text();

        let fetched = Date.now();
        let data = ICAL.parse(text);
        if (typeof data[0] == 'string') data = [data];

        let updated = false;
        let v3;

        await this._transaction(true, store => {
            let req = store.get(id);
            req.onsuccess = e => {
                let v2 = req.result;
                v3 = { ...v2, data, fetched };

                if (v1.fetched === v2.fetched) {
                    store.put(v3);
                    updated = true;
                }
            };
        });

        if (updated) this._change(v3);
    }

    // Update a calendar's details.
    //
    // - Be careful — any fields set to undefined will be undefined.
    // - The updated version is returned.
    async update(id, patch) {
        let cal;

        await this._transaction(true, store => {
            let req = store.get(id);
            req.onsuccess = e => {
                cal = { ...req.result, ...patch };
                store.put(cal);
            };
        });

        this._change(cal);
        return cal;
    }

    // Remove a calendar.
    async remove(id) {
        await this._transaction(true, store => {
            store.delete(id);
        });

        this._delete(id);
    }

    // List the ID of every single calendar.
    async list() {
        let ids;

        await this._transaction(false, store => {
            let req = store.getAllKeys();
            req.onsuccess = e => ids = req.result;
        });

        return ids;
    }

    async _transaction(write, func) {
        let db = await this.db;
        let tx = db.transaction(this.name, write ? 'readwrite' : 'readonly');

        func(tx.objectStore(this.name));

        await new Promise((resolve, reject) => {
            tx.oncomplete = e => resolve();
            tx.onerror = e => reject(tx.error);
        });
    }

    _change(cal) {
        this.dispatchEvent(new CustomEvent('change', { detail: cal }));
    }

    _delete(id) {
        this.dispatchEvent(new CustomEvent('delete', { detail: id }));
    }
}

export default new Calendars('calendars');
