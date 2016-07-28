precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;

void main() {
    vec4 tex = texture2D(texture, vUv);
    gl_FragColor = vec4(mix(vColor.rgb, tex.rgb * vColor.a, tex.a), 1.0);
}
