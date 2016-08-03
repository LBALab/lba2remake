precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 tex = texture2D(texture, uv);
    gl_FragColor = vec4(mix(vColor.rgb, tex.rgb * vColor.a, tex.a), tex.a);
}
