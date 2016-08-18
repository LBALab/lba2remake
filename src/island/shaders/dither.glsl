#require "./noise3D"

vec4 dither(vec2 uv) {
    float bias = clamp(max(length(dFdx(vPos)), length(dFdy(vPos))) * 900.0, 0.0, 1.0);
    float level1 = pow(2.0, 12.0 - floor(bias * 5.0));
    float level2 = level1 * 2.0;
    float noise1 = (snoise(vPos * level1) - 0.5);
    float noise2 = (snoise(vPos * level2) - 0.5);
    float noise = mix(noise1, noise2, 1.0 - fract(bias * 5.0));
    uv.y = uv.y + 0.5 / 16.0;
    uv.x = uv.x + noise * 0.0625 * (2.0 - bias);
    return texture2D(palette, uv);
}
