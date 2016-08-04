precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "./fog.frag"

#define ONE_PIXEL 0.00390625 // 1 / 256 = one pixel
#define HALF_PIXEL (ONE_PIXEL * 0.5)
#define PIXEL_WIDTH (1.0 - ONE_PIXEL)

void main() {
    vec2 mUv = mod(vUv, vUvGroup.zw);
    vec2 dist2 = abs(mUv / vUvGroup.zw - vec2(0.5)) * 2.0;
    float dist = max(dist2.x, dist2.y);
    dist = (clamp(dist, 0.9, 1.0) - 0.9) * 10.0;
    vec2 uv = mUv * PIXEL_WIDTH + vUvGroup.xy + vec2(HALF_PIXEL);
    vec4 tex = texture2D(texture, uv, -dist * 50.0);
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), tex.a);
}
