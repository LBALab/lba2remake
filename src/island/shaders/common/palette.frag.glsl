vec3 getPalColorI(float colorIndex, float intensity) {
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) / 16.0 + (intensity / 16.0) - 0.75,
        floor(colorIndex * 16.0) / 16.0
    );
    return texture(palette, uv + 0.03125).rgb;
}

vec3 getPalColor(float colorIndex, float intensity) {
    vec3 c0 = getPalColorI(colorIndex, floor(intensity));
    vec3 c1 = getPalColorI(colorIndex, ceil(intensity));
    return mix(c0, c1, fract(intensity));
}

vec4 lutLookup(vec3 c, float vOffset) {
    const vec2 uvScale = 1.0 / vec2(255.0, 127.0);
    const float invU = 1.0 / 8.0;
    vec2 uv = vec2(
        c.r + mod(c.g, 8.0) * 32.0,
        c.b * 4.0 + vOffset + floor(c.g * invU)
    ) * uvScale;
    return texture(lutTexture, uv);
}

vec3 mapToPal(vec3 color, float intensity) {
    vec3 c = floor(color * 31.0);
    vec4 i = lutLookup(c, 0.0);
    return getPalColor(i.a, intensity);
}
