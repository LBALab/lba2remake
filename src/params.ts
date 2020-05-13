import {map, each} from 'lodash';

const mobileRE = /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i;

let params = null;

const paramsDefinitions = {
    mobile: {
        type: 'boolean',
        default: mobileRE.test(navigator.userAgent)
    },
    scene: {
        type: 'int',
        default: -1
    },
    editor: {
        type: 'boolean',
        default: false
    },
    iso3d: {
        type: 'boolean',
        default: false
    },
    isoCam3d: {
        type: 'boolean',
        default: false
    },
    webgl2: {
        type: 'boolean',
        default: true
    },
    clipActors: {
        type: 'boolean',
        default: false
    },
    lang: {
        type: 'string',
        default: null
    },
    game: {
        type: 'string',
        default: 'lba2',
    },
    vrEmulator: {
        type: 'boolean',
        default: false
    },
    vrCtrlDBG: {
        type: 'boolean',
        default: false
    }
};

export function getParams(forceRefresh = false) : any {
    if (params && !forceRefresh) {
        return params;
    }
    params = {};
    const query = window.location.hash.replace(/^#/, '');
    const src = {};
    map(query.split('&'), (part) => {
        const [name, value] = part.split('=');
        if (name && name in paramsDefinitions) {
            src[name] = decodeURIComponent(value);
        } else if (name) {
            // tslint:disable-next-line:no-console
            console.warn(`Unknown parameter: ${part}.`);
        }
    });
    each(paramsDefinitions, (param, name) => {
        if (name in src) {
            params[name] = parseParam(param, name, src[name]);
        } else {
            params[name] = param.default;
        }
    });
    return params;
}

function parseParam(param, name, src) {
    switch (param.type) {
        case 'boolean':
            if (src === 'true') {
                return true;
            }
            if (src === 'false') {
                return false;
            }
            // tslint:disable-next-line:no-console
            console.warn(`Invalid value for param ${name}, value: ${src}, type=boolean`);
            return param.default;

        case 'int':
            try {
                const i = Number(src);
                if (Number.isNaN(i)) {
                    // tslint:disable-next-line:no-console
                    console.warn(`Invalid value for param ${name}, value: ${src}, type=int`);
                    return param.default;
                }
                return i;
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.warn(`Invalid value for param ${name}, value: ${src}, type=int`);
                return param.default;
            }

        case 'string':
            return src;
    }
    return param.default;
}
