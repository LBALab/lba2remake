vec4 texture2DPal(vec4 texInfo, float intensity) {
    float colorIndex = texInfo[0];
    vec2 uv = vec2(
        mod(colorIndex * 256.0, 16.0) / 16.0 + intensity / 32.0 - 0.5,
        floor(colorIndex * 16.0) / 16.0
    );
    return texture2D(palette, uv + 0.03125);
}
