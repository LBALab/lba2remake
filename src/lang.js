import {findIndex} from 'lodash';
import translations from './data/translations.json';
import languages from './data/languages.json';

let language = null;
let languageVoice = null;

export function initLanguageConfig(params) {
    const lang = params.lang || navigator.language.substring(0, 2);
    const ln = findIndex(languages, l => l.culture.substring(0, 2) === lang);
    const lnV = findIndex(
        languages,
        l => l.culture.substring(0, 2) === lang && l.hasVoice
    );
    language = languages[ln !== -1 ? ln : 0];
    languageVoice = languages[lnV !== -1 ? lnV : 0];
}

export function getLanguageConfig() {
    return {language, languageVoice};
}

export function tr(id) {
    if (language
        && language.code in translations
        && id in translations[language.code]) {
        return translations[language.code][id];
    }
    if (id in translations.EN) {
        return translations.EN[id];
    }
    return '?';
}
