vec3 getPalColor(float colorIndex, float intensity) {
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) / 16.0 + (intensity / 16.0) - 0.75,
        floor(colorIndex * 16.0) / 16.0
    );
    return texture(palette, uv + 0.03125).rgb;
}

vec3 mapToPal(vec3 color, float intensity) {
    float colorIndex = texture(lutTexture, color).a;
    vec3 c0 = getPalColor(colorIndex, floor(intensity));
    vec3 c1 = getPalColor(colorIndex, ceil(intensity));
    return mix(c0, c1, fract(intensity));
}
