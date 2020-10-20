uniform vec3 light;
uniform vec3 color;
uniform vec3 spotsPos[NUM_SPOTS];
uniform float spotsSize[NUM_SPOTS];
uniform float spotsIntensity[NUM_SPOTS];

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;

#require "../../../island/shaders/common/lut.frag"

float intensity() {
    float dp = dot(vNormal, light);
    return clamp(dp, 0.1, 1.0) * 15.0;
}

void main() {
    float d = 0.0;
    for (int i = 0; i < NUM_SPOTS; i++) {
        float s = mix(0.001, spotsSize[i], spotsIntensity[i]);
        float nd = 1.0 - clamp(length(vPos - spotsPos[i]) / s, 0.0, 1.0);
        d = max(d, nd);
    }
    float cf = d * 0.92 + 0.08;
    vec4 tgt = vec4(color * cf, 1.0);
    vec3 palColor = lutLookup(color.rgb, intensity());
    vec4 src = vec4(palColor, 1.0);
    gl_FragColor = mix(src, tgt, vUv.x);
}
