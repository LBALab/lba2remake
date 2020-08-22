uniform sampler2D map;
uniform vec3 color;
uniform vec3 offset;
uniform vec4 spots[NUM_SPOTS];

varying vec3 vPos;

void main() {
    float d = 0.0;
    for (int i = 0; i < NUM_SPOTS; i++) {
        vec4 spot = spots[i];
        vec3 pt = normalize(spot.xyz) * 17.125 + offset;
        float s = mix(0.001, 5.0, spot.w);
        float nd = 1.0 - clamp(length(vPos - pt) / s, 0.0, 1.0);
        d = max(d, nd);
    }
    float cf = d * 0.9 + 0.1;
    float alpha = 1.0;
    if (color.r < 0.001) {
        alpha = 1.0 - d;
    }
    gl_FragColor = vec4(color * cf, alpha);
}
