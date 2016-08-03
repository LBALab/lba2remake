uniform vec3 fogColor;

vec3 fog(vec3 color) {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogDensity = 0.25;
    float a = exp2(-fogDensity * fogDensity * depth * depth * 1.442695);
    float fogFactor = 1.0 - clamp(a, 0.0, 1.0);
    return mix(color, fogColor, fogFactor);
}