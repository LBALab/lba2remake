import charmaps from '../data/charmaps.json';

import { loadResource, ResourceType } from '../resources';

export function getTextFile(language) {
    const fanSuffix = language.isFan ? `_${language.code}` : '';
    return `TEXT${fanSuffix}.HQR`;
}

export async function loadTexts(language, index) {
    const resource = await loadResource(ResourceType.TEXT);
    return loadTextData(resource, getLanguageTextIndex(language, index));
}

function getLanguageTextIndex(language, index) {
    const languageIndex = index + (30 * language.index);
    return { data: language, index: languageIndex };
}

export function loadTextData(resource, language) {
    const mapData = new Uint16Array(resource.getEntry(language.index));
    const data = new DataView(resource.getEntry(language.index + 1));
    const texts = {};
    let start;
    let end;
    let idx = 0;

    const charmap = charmaps[language.data.charmap];

    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16((idx * 2) + 2, true);
        const type = data.getUint8(start);
        const value = [];
        for (let i = start + 1; i < end - 1; i += 1) {
            value.push(String.fromCharCode(charmap ?
                charmap[data.getUint8(i)]
                : data.getUint8(i))
            );
        }
        texts[mapData[idx]] = {type, index: idx, value: value.join('')};
        idx += 1;
    } while (end < data.byteLength);

    return texts;
}
