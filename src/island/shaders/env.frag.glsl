precision highp float;

uniform sampler2D texture;

varying vec2 vUv;
varying float depth;

void main() {
    vec4 tex = texture2D(texture, vUv * 128.0);
    gl_FragColor = vec4(tex.rgb, 1.0 - depth * 0.1);
}
