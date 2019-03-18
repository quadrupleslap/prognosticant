class Settings {
    constructor(name, defaults) {
        this.prefix = name + '/';
        this.defaults = defaults;
    }

    async set(key, value) {
        this._validate(key);
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    async get(key) {
        this._validate(key);
        let s = localStorage.getItem(this.prefix + key);
        return s ? this.defaults[key] : JSON.parse(s);
    }

    _validate(key) {
        if (!this.defaults.hasOwnProperty(key)) {
            throw new Error(`unknown setting '${key}'`);
        }
    }
}

export default new Settings('settings', {});
