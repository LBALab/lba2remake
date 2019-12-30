uniform vec3 fogColor;
uniform float fogDensity;
uniform float worldScale;

vec3 fog(vec3 color) {
    float depth = length(vMVPos) * worldScale;
    float a = exp2(-fogDensity * fogDensity * depth * depth * 0.003);
    float fogFactor = clamp(a, 0.0, 1.0);
    return mix(fogColor, color, fogFactor);
}
