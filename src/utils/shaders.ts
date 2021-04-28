import { map, tail, filter } from 'lodash';
import { getParams } from '../params';

const R_IN = /^( *)in( .*)\r?$/;
const R_OUT = /^( *)out( .*)\r?$/;
const R_FRAGCOLOR = /^( *)fragColor( .*)\r?$/;
const R_TEXTURE = /^(.*)texture\((.*)\r?$/;
const R_PRECISION = /^( *)precision(.*)\r?$/;

declare global {
    interface Window {
        WebGL2RenderingContext?: any;
    }
}

export function compile(type, source: string) {
    const lines = source.split('\n');
    const webGL2 = window.WebGL2RenderingContext && getParams().webgl2;
    if (!webGL2) {
        const precision = [];
        const preproc = [];
        let isPreproc = true;
        const tgtLines = map(tail(lines), (line) => {
            if (isPreproc && line[0] === '#') {
                preproc.push(line);
                return null;
            }
            isPreproc = false;
            if (type === 'vert') {
                line = line.replace(R_IN, '$1attribute$2');
                line = line.replace(R_OUT, '$1varying$2');
            } else {
                if (R_OUT.test(line)) {
                    return null;
                }
                line = line.replace(R_IN, '$1varying$2');
                line = line.replace(R_FRAGCOLOR, '$1gl_FragColor$2');
            }
            line = line.replace(R_TEXTURE, '$1texture2D($2');
            if (R_PRECISION.test(line)) {
                precision.push(line);
                line = line.replace(R_PRECISION, '');
            }
            return line;
        });
        return [
            preproc.join('\n'),
            precision.join('\n'),
            filter(tgtLines, l => l !== null).join('\n')
        ].join('\n');
    }
    const defWebGL2 = '#define WEBGL2 1';
    return `${lines[0]}${'\n'}${defWebGL2}${'\n'}${tail(lines).join('\n')}`;
}
