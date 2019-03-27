vec3 getPalColor(float colorIndex, float intensity) {
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) / 16.0 + (intensity / 16.0) - 0.75,
        floor(colorIndex * 16.0) / 16.0
    );
    return texture(palette, uv + 0.03125).rgb;
}

vec3 mapToPal(vec3 color, float intensity) {
    const vec2 uvScale = 1.0 / vec2(255.0, 127.0);
    const float invU = 1.0 / 8.0;
    vec3 c = floor(color * 31.0);
    vec2 uv = vec2(
        c.r + mod(c.g, 8.0) * 32.0,
        c.b * 4.0 + floor(c.g * invU)
    ) * uvScale;
    float colorIndex = texture(lutTexture, uv).a;
    vec3 c0 = getPalColor(colorIndex, floor(intensity));
    vec3 c1 = getPalColor(colorIndex, ceil(intensity));
    return mix(c0, c1, fract(intensity));
}
