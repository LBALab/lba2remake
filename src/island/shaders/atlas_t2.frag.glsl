precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec2 vUv2;
varying vec4 vUvGroup;
varying vec4 vUvGroup2;

void main() {
    vec2 uv = vec2(mod(vUv[0], vUvGroup2[2]) + vUvGroup2[0], mod(vUv[1], vUvGroup2[3]) + vUvGroup2[1]);
    vec4 tex = texture2D(texture, uv);
    gl_FragColor = vec4(mix(vColor.rgb, tex.rgb * vColor.a, tex.a), tex.a);
}
