#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;
uniform float opacity;
uniform float lightningStrength;
uniform vec3 lightningPos;

in vec2 vUv;
in vec3 vMVPos;
in vec3 vPos;

out vec4 fragColor;

#require "../common/fog.frag"

float lIntensity(float distLightning) {
    float dist = 1.0 - clamp(distLightning * 0.2 * (1.0 / (lightningStrength + 0.1)), 0.0, 1.0);
    return dist * dist * lightningStrength;
}

vec3 lightning(vec3 color, float distLightning) {
    return mix(color, lFog(vec3(1.0)), lIntensity(distLightning));
}

void main() {
    float distLightning = length(vec2(vPos.x, vPos.z) - vec2(lightningPos.x, lightningPos.z));
    vec3 color = texture(uTexture, vUv * scale).rgb;
    vec3 colWithFog = fog(color);
    vec3 colWithLightning = lightning(colWithFog, distLightning);
    fragColor = vec4(colWithLightning, opacity);
}
