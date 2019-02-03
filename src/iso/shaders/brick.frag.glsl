precision highp float;

uniform sampler2D library;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(texture2D(library, vUv));
}
