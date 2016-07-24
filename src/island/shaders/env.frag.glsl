precision highp float;

uniform sampler2D texture;
uniform vec2 offset;

varying vec2 vUv;
varying float depth;

void main() {
    vec2 uv = mod(vUv * 128.0, 0.5) + offset;
    vec4 tex = texture2D(texture, uv);
    gl_FragColor = vec4(tex.rgb, 1.0 - depth * 0.1);
}
