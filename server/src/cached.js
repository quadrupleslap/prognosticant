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
        this.queue = [];
    }

    serve(req, res) {
        if (this.queue.length) {
            this.queue.push(res);
        } else if (Date.now() > this.expiry) {
            this.queue.push(res);
            this.refresh();
        } else {
            res.set(this.headers)
            res.send(this.cached);
        }
    }

    async refresh() {
        try {
            this.cached = JSON.stringify(await this.load());
            this.expiry = Date.now() + this.maxage;

            for (let res of this.queue) {
                res.set(this.headers)
                res.send(this.cached);
            }
        } catch {
            for (let res of this.queue) {
                res.sendStatus(500);
            }
        }

        this.queue = [];
    }
};
