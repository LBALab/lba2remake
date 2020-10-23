#version 300 es
precision highp float;

uniform sampler2D txSmoke;
uniform sampler2D txEnv;
uniform float opacity;
uniform float lightningStrength;
uniform vec3 lightningPos;
uniform float whiteness;
uniform float scale;

in vec2 vUv;
in vec3 vMVPos;
in vec3 vPos;

out vec4 fragColor;

#require "../../shaders/common/fog.frag"

float lIntensity(float distLightning) {
    float adjStrength = lightningStrength * 0.25;
    float dist = 1.0 - clamp(distLightning * 0.03 * (1.0 / (adjStrength + 0.1)), 0.0, 1.0);
    return dist * dist * dist * adjStrength;
}

vec4 lightning(vec3 color, float distLightning, float preAlpha) {
    float intensity = lIntensity(distLightning);
    vec3 tgtColor = mix(color, lFog(vec3(1.0)), intensity * 1.3);
    float alpha = mix(preAlpha, 1.0, intensity);
    return vec4(tgtColor, alpha);
}

void main() {
    vec3 lp = vec3(lightningPos.x, 20.0, lightningPos.z);
    float distLightning = length(vPos - lp);
    vec4 color = texture(txSmoke, vUv);
    vec3 color2 = texture(txEnv, vUv * scale).rgb;
    vec3 tgtColor = mix(vec3(0.0), color2, color.r);
    vec3 colWithWhiteness = mix(tgtColor, vec3(1.0), whiteness);
    vec3 colWithFog = fog(colWithWhiteness);
    fragColor = lightning(colWithFog, distLightning, color.a * opacity);
    // fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
