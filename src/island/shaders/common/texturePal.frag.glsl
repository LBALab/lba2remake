vec4 texturePal(float colorIndex, float intensity) {
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) / 16.0 + intensity / 32.0 - 0.5,
        floor(colorIndex * 16.0) / 16.0
    );
    return texture(palette, uv + 0.03125);
}
