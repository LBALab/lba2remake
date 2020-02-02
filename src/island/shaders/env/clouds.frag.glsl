#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float opacity;
uniform float lightningStrength;
uniform vec3 lightningPos;

in vec2 vUv;
in vec3 vMVPos;
in vec3 vPos;

out vec4 fragColor;

#require "../common/fog.frag"

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
    vec4 color = texture(uTexture, vUv);
    vec3 color2 = texture(uTexture2, vUv).rgb;
    vec3 tgtColor = mix(vec3(0.0), color2, color.r);
    vec3 colWithFog = fog(tgtColor.rgb);
    fragColor = lightning(colWithFog, distLightning, color.a * opacity);
}
