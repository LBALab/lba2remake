uniform sampler2D map;
uniform vec3 color;
uniform vec3 offset;
uniform vec4 spot;

varying vec2 vUv;
varying vec3 vPos;

void main() {
    vec3 pt = normalize(spot.xyz) * 17.125 + offset;
    float s = mix(0.001, 5.0, spot.w);
    float d = 1.0 - clamp(length(vPos - pt) / s, 0.0, 1.0);
    float cf = d * 0.95 + 0.05;
    // gl_FragColor = mix(texture(map, vUv), vec4(1.0, 0.0, 0.0, 1.0), d);
    // gl_FragColor = mix(vec4(color, 1.0), vec4(1.0, 0.0, 0.0, 1.0), d);
    float alpha = 1.0;
    if (color.r < 0.001) {
        alpha = 1.0 - d;
    }
    gl_FragColor = vec4(color * cf, alpha);
}
