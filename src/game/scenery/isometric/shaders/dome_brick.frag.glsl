precision highp float;

uniform sampler2D library;

varying vec2 vUv;
varying vec3 vPos;

#require "./dome_floor_effect.frag"

void main() {
    gl_FragColor = texture2D(library, vUv);
    gl_FragColor.a = gl_FragColor.a * getFloorOpacity(vPos);
    if (gl_FragColor.a < 0.005) {
        discard;
    }
}
