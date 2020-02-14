uniform float lightningStrength;

varying float alpha;
varying vec3 vMVPos;
varying float vDistLightning;

float lIntensity() {
    float strength = 1.0 / (lightningStrength + 0.1);
    float dist = 1.0 - clamp(vDistLightning * 0.03 * strength, 0.0, 1.0);
    return dist * dist * lightningStrength;
}

void main() {
    float depth = length(vMVPos) * 1.25;
    float fogDensity = 0.8; // 0.8
    float a = exp2(-fogDensity * fogDensity * depth * depth * 0.003);
    float fogFactor = clamp(a, 0.0, 1.0);
    vec3 color = vec3(0.5, 0.5, 0.6);
    vec4 tgt = vec4(color, 0.16 * alpha * fogFactor);
    gl_FragColor = mix(tgt, vec4(1.0, 1.0, 1.0, alpha * fogFactor), lIntensity());
}
