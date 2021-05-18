#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec3 light;
uniform float uOpacity;

in vec3 vNormal;
in vec2 vUv;

out vec4 fragColor;

#require "../../../island/shaders/common/lut.frag"

float intensity() {
    float dp = dot(vNormal, light);
    return clamp(dp, 0.1, 1.0) * 15.0;
}

void main() {
    vec4 texColor = texture(uTexture, vUv);
    vec3 palColor = lutLookup(texColor.rgb, intensity());
    fragColor = vec4(palColor, texColor.a * uOpacity);
}
