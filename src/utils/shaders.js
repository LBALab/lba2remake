import { map, tail } from "lodash";

const header =
`#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif`;

const textureLODExt =
`#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif`;

const textureLodPolyfill =
`vec4 textureLodPolyfill(sampler2D tex, vec2 uv, float bias) {
#ifdef GL_EXT_shader_texture_lod
    return texture2DLodEXT(tex, uv, bias);
#else
    return texture2D(tex, uv);
#endif
}`;

const R_IN = /^( *)in( .*)\r?$/;
const R_OUT = /^( *)out( .*)\r?$/;
const R_FRAGCOLOR = /^( *)fragColor( .*)\r?$/;
const R_TEXTURE = /^(.*)texture\((.*)\r?$/;
const R_TEXTURE_LOD = /^(.*)textureLod\((.*)\r?$/;
const R_PRECISION = /^( *)precision(.*)\r?$/;

export function compile(type, source) {
    const lines = source.split('\n');
    if (!lines[0].match('#version 300 es')) {
        throw new Error('Shader must have "#version 300 es" directive as first line');
    }
    const webGL2 = window.WebGL2RenderingContext && window.params.webgl2;
    if (!webGL2) {
        const polyFills = [];
        const polyFillsExt = [];
        const precision = [];
        let useTextureLod = false;
        const tgtLines = map(tail(lines), line => {
            if (type === 'vert') {
                line = line.replace(R_IN, '$1attribute$2');
                line = line.replace(R_OUT, '$1varying$2');
            } else {
                line = line.replace(R_IN, '$1varying$2');
                line = line.replace(R_OUT, '');
                line = line.replace(R_FRAGCOLOR, '$1gl_FragColor$2');
            }
            line = line.replace(R_TEXTURE, '$1texture2D($2');
            if (R_TEXTURE_LOD.test(line)) {
                useTextureLod = true;
                line = line.replace(R_TEXTURE_LOD, '$1textureLodPolyfill($2');
            }
            if (R_PRECISION.test(line)) {
                precision.push(line);
                line = line.replace(R_PRECISION, '');
            }
            return line;
        });
        if (useTextureLod) {
            polyFillsExt.push(textureLODExt);
            polyFills.push(textureLodPolyfill);
        }
        return [
            header,
            polyFillsExt.join('\n'),
            precision.join('\n'),
            polyFills.join('\n'),
            tgtLines.join('\n')
        ].join('\n');
    }
    return lines.join('\n');
}
