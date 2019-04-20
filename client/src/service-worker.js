const ASSETS = [
    /^index\./,
    /\.woff2$/,
];

self.addEventListener('install', e => {
    e.waitUntil(core());
});

self.addEventListener('fetch', e => {
    e.respondWith(serve(e.request));
});

async function serve(req, path) {
    path = path || new URL(req.url).pathname;

    if (path.startsWith('/data/')) {
        return fetch(req);
    }

    if (path.includes('.')) {
        let cache = await caches.open('main');
        let neu = fetch(req);

        neu.then(neu => {
            cache.put(req, neu.clone());
        });

        return cache.match(req).then(old => old || neu);
    }

    return serve(req, '/index.html');
}

async function core() {
    let manifest = await fetch('parcel-manifest.json');
    if (!manifest.ok) throw new Error();
    manifest = await manifest.json();

    let cache = await caches.open('main');

    let urls = Object.keys(manifest)
        .filter(k => ASSETS.some(t => t.test(k)))
        .map(k => manifest[k]);

    await cache.addAll(urls);
}
