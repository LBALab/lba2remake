precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

void main() {
    vec2 uv = vec2(mod(vUv[0], vUvGroup[2]) + vUvGroup[0], mod(vUv[1], vUvGroup[3]) + vUvGroup[1]);
    vec4 tex = texture2D(texture, uv);
    gl_FragColor = vec4(mix(vColor.rgb, tex.rgb * vColor.a, tex.a), 1.0);
}
