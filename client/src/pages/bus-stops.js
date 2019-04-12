import modal from 'f7k/modal';
import { html, text } from 'f7k/base';
import cat from '../components/cat';
import loader from '../components/loader';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

export default function busStops(title, places) {
    modal('modal', close => {
        let map;

        let $map, $body = [
            html('header.header', {
                child: [
                    html('button.icon-button.material-icons', {
                        child: text('close'),
                        onclick: close,
                    }),
                    cat('h2', title),
                ],
            }),
            $map = html('.buses-map', {
                destroy() {
                    if (map) map.remove();
                },
            }),
        ];

        import('leaflet').then(L => {
            map = L.map($map, { attributionControl: false });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            let sum = [0, 0], cnt = 0;
            let names = Object.keys(places);

            let icon = L.icon({
                iconUrl,
                iconRetinaUrl,
                shadowUrl,
                iconSize:      [25, 41],
                iconAnchor:    [12, 41],
                popupAnchor:   [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize:    [41, 41],
            });

            for (let name of names) {
                let { coords, center } = places[name];

                L.marker(coords, { icon })
                    .addTo(map)
                    .bindTooltip(name, { permanent: true })

                if (center) {
                    sum[0] += coords[0];
                    sum[1] += coords[1];
                    cnt += 1;
                }
            }

            map.setView(sum.map(x => x / cnt), 16);
        });

        return $body;
    });
}
