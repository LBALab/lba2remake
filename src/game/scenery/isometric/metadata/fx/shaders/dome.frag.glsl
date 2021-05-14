precision highp float;

varying vec4 vColor;
varying vec3 vPos;

#require "../../../shaders/dome_floor_effect.frag"

void main() {
    gl_FragColor = vColor;
    gl_FragColor.a = gl_FragColor.a * getFloorOpacity(vPos);
    if (gl_FragColor.a < 0.005) {
        discard;
    }
}
