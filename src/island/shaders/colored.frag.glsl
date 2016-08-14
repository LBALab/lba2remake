#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec3 vPos;

#require "./fog.frag"
#require "./noise3D"

void main() {
    float bias = clamp(max(length(dFdx(vPos)), length(dFdy(vPos))) * 800.0, 0.0, 1.0);
    float level1 = pow(2.0, 12.0 - floor(bias * 5.0));
    float level2 = level1 * 2.0;
    vec2 pUv = vColorInfo / 16.0;
    float noise1 = (snoise(vPos * level1) - 0.5) * 0.125 * (2.0 - bias);
    float noise2 = (snoise(vPos * level2) - 0.5) * 0.125 * (2.0 - bias);
    float noise = mix(noise1, noise2, 1.0 - fract(bias * 5.0));
    pUv.x = pUv.x + noise;
    vec4 vColor = texture2D(palette, pUv);
    vec3 color = vColor.rgb;
    gl_FragColor = vec4(fog(color), 1.0);
}
