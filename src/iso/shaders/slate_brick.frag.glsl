#version 300 es
precision highp float;

uniform sampler2D library;
uniform vec3 heroPos;

in vec2 vUv;
in vec3 vPos;

out vec4 fragColor;

void main() {
    fragColor = texture(library, vUv);
    float opacity = 1.0 - clamp(length(vPos - heroPos) * 0.75 - 0.2, 0.0, 1.0);
    // fragColor.rgb = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), opacity);
    fragColor.a = fragColor.a * opacity;
    if (fragColor.a < 0.1) {
        discard;
    }
}
