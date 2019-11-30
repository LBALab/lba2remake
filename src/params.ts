import {map, each} from 'lodash';

const mobileRE = /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i;

declare global {
    interface Window {
        params?: any;
    }
}

window.params = {};

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
    firstPerson: {
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
    }
};

export function loadParams() : any {
    const query = window.location.hash.replace(/^#/, '');
    const src = {};
    const tgt = {};
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
            tgt[name] = parseParam(param, name, src[name]);
        } else {
            tgt[name] = param.default;
        }
        window.params[name] = tgt[name];
    });
    return tgt;
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
