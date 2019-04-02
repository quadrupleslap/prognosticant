import { html, text } from 'f7k/base';

// All credit for the color palette belongs to Google.

const COLORS = `
#AD1547 Beetroot
#F4511E Tangerine
#E4C441 Citron
#0B8043 Basil
#3F51B5 Blueberry
#8E24AA Grape
#D81B60 Cherry Blossom
#EF6C00 Pumpkin
#C0CA33 Avocado
#009688 Eucalyptus
#7986CB Lavender
#795548 Cocoa
#D50000 Tomato
#F09300 Mango
#7CB342 Pistachio
#039BE5 Peacock
#B39DDB Wisteria
#616161 Graphite
#E67C73 Flamingo
#F6BF26 Banana
#33B679 Sage
#4285F4 Cobalt
#9E69AF Amethyst
#A79B8E Birch
`.split('\n').filter(x => x).map(s => {
    let [_, code, name] = s.match(/^([^ ]*) (.*)$/);
    return { code, name };
});

export default function colorPicker(formName, initial) {
    let child = COLORS.map(x => radio(formName, x.code, x.name));

    if (initial) {
        let i = COLORS.findIndex(x => x.code == initial);
        if (i < 0) {
            child.push(radio(formName, initial, 'Custom'));
            child[COLORS.length].checked = true;
        } else {
            child[i].checked = true;
        }
    } else {
        child[Math.random() * COLORS.length | 0].checked = true;
    }

    return html('.color-picker', { child });
}

function radio(formName, code, name) {
    let radio = html('input', {
        type: 'radio',
        required: true,
        title: name,
        name: formName,
        value: code,
    });

    radio.style.color = code;
    return radio;
}
