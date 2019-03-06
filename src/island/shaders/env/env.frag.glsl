#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;

in vec2 vUv;

out vec4 fragColor;

float fog() {
    float depth = (gl_FragCoord.z * 0.04) / gl_FragCoord.w;
    float a = exp2(-0.25 * depth * depth * 1.442695);
    return a;
}

void main() {
    vec3 color = texture(uTexture, vUv * scale).rgb;
    fragColor = vec4(color, fog());
}
