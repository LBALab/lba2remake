import charmaps from '../../data/charmaps.json';
import { Resource } from '../load';

export const parseText = (
    resource: Resource,
    index: number,
    language: any,
    skipCharacters: number
) => {
    const mapData = new Uint16Array(resource.getEntry(index));
    const data = new DataView(resource.getEntry(index + 1));
    const charmap = charmaps[language.charmap];
    const texts = {};
    let start;
    let end;
    let idx = 0;
    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16((idx * 2) + 2, true);
        const type = data.getUint8(start);
        const value = [];
        for (let i = start + skipCharacters; i < end - skipCharacters; i += 1) {
            value.push(String.fromCharCode(charmap ?
                charmap[data.getUint8(i)]
                : data.getUint8(i))
            );
        }
        texts[mapData[idx]] = {type, index: idx, value: value.join('')};
        idx += 1;
    } while (end < data.byteLength);
    return texts;
};

export const parseTextLBA2 = (resource: Resource, index: number, language: any) => {
    const languageIndex = index + (30 * language.index);
    return parseText(resource, languageIndex, language, 1);
};
