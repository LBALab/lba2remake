import async from 'async';

import {loadHqrAsync} from '../hqr';

export function loadTextsAsync(language, index) {
    return callback => loadTexts(language, index, (texts) => {
        callback(null, texts);
    });
}

export function getTextFile(language) {
    const fanSuffix = language.isFan ? `_${language.code}` : '';
    return `TEXT${fanSuffix}.HQR`;
}

export function loadTexts(language, index, callback) {
    async.auto({
        text: loadHqrAsync(getTextFile(language)),
    }, (err, files) => {
        const text = loadTextData(files.text, getLanguageTextIndex(language, index));
        if (callback) {
            callback(text);
        }
    });
}

function getLanguageTextIndex(language, index) {
    const languageIndex = index + 30 * language.index;
    return { data: language, index: languageIndex };
}

export function loadTextData(textFile, language) {
    const mapData = new Uint16Array(textFile.getEntry(language.index));
    const data = new DataView(textFile.getEntry(language.index + 1));
    const texts = {};
    let start;
    let end;
    let idx = 0;

    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16(idx * 2 + 2, true);
        const type = data.getUint8(start, true);
        let value = '';
        for (let i = start + 1; i < end - 1; i += 1) {
            value += String.fromCharCode((language.data.charmap) ?
                language.data.charmap[data.getUint8(i)]
                : data.getUint8(i)
            );
        }
        texts[mapData[idx]] = {type, index: idx, value};
        idx += 1;
    } while (end < data.byteLength);

    return texts;
}
