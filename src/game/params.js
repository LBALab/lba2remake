// @flow
import {map, each} from 'lodash';

const paramsDefinitions = {
    vr: {
        type: 'boolean',
        default: false,
        reload: true
    },
    mobile: {
        type: 'boolean',
        default: /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        reload: true
    },
    scene: {
        type: 'int',
        default: 0,
        reload: false,
        refresh: (value, game) => {
            game.getSceneManager().goto(value);
        }
    },
    noscripts: {
        type: 'boolean',
        default: false,
        reload: true
    },
};

export function loadParams() : Object {
    const query = window.location.hash.replace(/^#/, '');
    const src = {};
    const tgt = {};
    map(query.split("&"), part => {
        const [name, value] = part.split("=");
        if (name in paramsDefinitions) {
            src[name] = decodeURIComponent(value);
        } else {
            console.warn(`Unknown parameter: ${part}.`);
        }
    });
    each(paramsDefinitions, (param, name) => {
        if (name in src) {
            tgt[name] = parseParam(param, name, src[name]);
        } else {
            tgt[name] = param.default;
        }
    });
    return tgt;
}

export function watchParams(game: Object) {
    window.addEventListener('hashchange', () => {
        const newParams = loadParams();
        each(newParams, (newValue, name) => {
            if (game.params[name] !== newValue) {
                game.params[name] = newValue;
                if (paramsDefinitions[name].reload)
                    window.location.reload();
                else if ('refresh' in paramsDefinitions[name])
                    paramsDefinitions[name].refresh(newValue, game);
            }
        });
    }, false);
}

function parseParam(param, name, src) {
    switch (param.type) {
        case 'boolean':
            if (src === 'true') {
                return true;
            } else if (src === 'false') {
                return false;
            } else {
                console.warn(`Invalid value for param ${name}, value: ${src}, type=boolean`);
                return param.default;
            }
        case 'int':
            try {
                return parseInt(src);
            } catch (e) {
                console.warn(`Invalid value for param ${name}, value: ${src}, type=int`);
                return param.default;
            }
    }
    return param.default;
}