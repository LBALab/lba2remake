#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec2 vUv;
varying vec3 vPos;

#require "./fog.frag"
#require "./dither"

vec4 colorFromPalette(vec4 texInfo, float colorIndex) {
    return texture2D(palette, vec2(mod(colorIndex * 256.0, 16.0) / 16.0 + vColorInfo.x / 32.0 - 0.5, floor(colorIndex * 16.0) / 16.0));
}

vec4 colorInterpolation(vec4 texInfo) {
    vec2 itrp = floor(fract(vUv * 128.0) * 2.0);
    vec4 a = colorFromPalette(texInfo, texInfo[0]);
    vec4 b = colorFromPalette(texInfo, texInfo[1]);
    vec4 c = colorFromPalette(texInfo, texInfo[2]);
    vec4 d = colorFromPalette(texInfo, texInfo[3]);
    float xNeg = 1.0 - itrp.x;
    float yNeg = 1.0 - itrp.y;
    return a * xNeg * yNeg + c * itrp.x * yNeg + b * xNeg * itrp.y + d * itrp.x * itrp.y;
}

void main() {
    vec4 texInfo = texture2D(texture, vUv);
    vec4 tex = colorInterpolation(texInfo);
    vec4 color = dither(vColorInfo / 16.0);
    vec3 fColor = mix(color.rgb, tex.rgb, tex.a);
    gl_FragColor = vec4(fog(tex.rgb), 1.0);
    //gl_FragColor = vec4(texInfo.x, texInfo.x, texInfo.x, 1.0);
}
