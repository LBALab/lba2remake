#version 300 es
precision highp float;

uniform vec3 heroPos;

in vec4 vColor;
in vec3 vPos;

out vec4 fragColor;

void main() {
    fragColor = vColor;
    float opacity = 1.0 - clamp(length(vPos - heroPos) * 0.9 - 0.4, 0.0, 1.0);
    fragColor.a = fragColor.a * opacity;
    if (fragColor.a < 0.1) {
        discard;
    }
}
