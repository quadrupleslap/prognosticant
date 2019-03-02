module.exports = class Cached {
    constructor(maxage, load) {
        this.load = load;
        this.maxage = maxage * 1000;
        this.headers = {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${maxage}`,
        };
        this.expiry = 0;
        this.cached = null;
    }
    async serve(req, res) {
        if (Date.now() > this.expiry) {
            try {
                this.cached = JSON.stringify(await this.load());
            } catch {
                return res.sendStatus(500);
            }
            this.expiry = Date.now() + this.maxage;
        }
        res.set(this.headers)
        return res.send(this.cached);
    }
};
