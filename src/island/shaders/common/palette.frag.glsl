vec3 getPalColor(float colorIndex) {
    const float inv16 = 1.0 / 16.0;
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) * inv16,
        floor(colorIndex * 16.0) * inv16
    );
    return texture(palette, uv + 0.03125).rgb;
}

vec4 lutLookup(vec3 c, float intensity) {
    const vec2 uvScale = 1.0 / vec2(511.0, 1023.0);
    const float invU = 1.0 / 16.0;
    vec2 uv = vec2(
        c.r + mod(c.g, 16.0) * 32.0,
        c.b * 2.0 + floor(c.g * invU)
    ) * uvScale + vec2(0.0, intensity / 16.0);
    return texture(lutTexture, uv);
}

vec3 mapToPal(vec3 color, float intensity) {
    vec3 c = floor(color * 31.0);
    vec4 i0 = lutLookup(c, floor(intensity));
    vec4 i1 = lutLookup(c, ceil(intensity));
    vec3 p0 = getPalColor(i0.a);
    vec3 p1 = getPalColor(i1.a);
    return mix(p0, p1, fract(intensity));
}
