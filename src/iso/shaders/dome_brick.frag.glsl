#version 300 es
precision highp float;

uniform sampler2D library;

in vec2 vUv;
in vec3 vPos;

out vec4 fragColor;

#require "./dome_floor_effect.frag"

void main() {
    fragColor = texture(library, vUv);
    fragColor.a = fragColor.a * getFloorOpacity(vPos);
    if (fragColor.a < 0.005) {
        discard;
    }
}
