float mipLevel(vec2 uv) {
    vec2 dx = dFdx(uv * 256.0);
    vec2 dy = dFdy(uv * 256.0);
    float d = max(dot(dx, dx), dot(dy, dy));
    return floor(0.5 * log2(d) + 0.5);
}

float mipmapLookup(vec2 uv) {
    return textureLod(uTexture, uv, min(mipLevel(uv), 3.0)).r;
}
