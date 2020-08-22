uniform vec3 color;
uniform vec3 spotsPos[NUM_SPOTS];
uniform float spotsSize[NUM_SPOTS];
uniform float spotsIntensity[NUM_SPOTS];

varying vec3 vPos;

void main() {
    float d = 0.0;
    for (int i = 0; i < NUM_SPOTS; i++) {
        float s = mix(0.001, spotsSize[i], spotsIntensity[i]);
        float nd = 1.0 - clamp(length(vPos - spotsPos[i]) / s, 0.0, 1.0);
        d = max(d, nd);
    }
    float cf = d * 0.9 + 0.1;
    float alpha = 1.0;
    if (color.r < 0.001) {
        alpha = 1.0 - d;
    }
    gl_FragColor = vec4(color * cf, alpha);
}
