import translations from './data/translations.json';

export default function tr(game, id) {
    const lang = game.getState().config.language;
    if (lang.code in translations
        && id in translations[lang.code]) {
        return translations[lang.code][id];
    }
    if (id in translations.EN) {
        return translations.EN[id];
    }
    return '?';
}
