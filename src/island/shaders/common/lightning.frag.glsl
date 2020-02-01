#require "./easing.frag"

uniform float lightningStrength;

float easeIntensity(float t) {
    float o = quadraticOut(t + 0.5);
    return clamp(mix(t, o * 2.0, 1.0), 0.1, 1.0);
}

float lIntensity() {
    float dist = 1.0 - clamp(vDistLightning * 0.03 * (1.0 / (lightningStrength + 0.1)), 0.0, 1.0);
    return dist * dist * lightningStrength;
}

vec3 lightning(vec3 color) {
    return mix(color, vec3(1.0), lIntensity());
}

float lightningIntensity(float intensity) {
    return mix(intensity, easeIntensity(intensity), lIntensity());
}
