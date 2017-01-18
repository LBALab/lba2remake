vec4 texture2DPal(vec4 texInfo, vec2 uv) {
    float colorIndex = texInfo[0];
    return texture2D(palette, vec2(mod(colorIndex * 256.0, 16.0) / 16.0 + vColor / 32.0 - 0.5, floor(colorIndex * 16.0) / 16.0) + 0.03125);
}
