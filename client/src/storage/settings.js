class Settings {
    constructor(name, defaults) {
        this.prefix = name + '/';
        this.defaults = defaults;
    }

    async set(key, value) {
        this._validate(key);
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    get(key) {
        this._validate(key);
        let s = localStorage.getItem(this.prefix + key);
        return s ? JSON.parse(s) : this.defaults[key]();
    }

    _validate(key) {
        if (!this.defaults.hasOwnProperty(key)) {
            throw new Error(`unknown setting '${key}'`);
        }
    }
}

export default new Settings('settings', {
    '24h': () => false,
    'weather': () => true,
});
