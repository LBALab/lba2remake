float mipLevel(vec2 uv) {
    vec2 dx = dFdx(uv * 256.0);
    vec2 dy = dFdy(uv * 256.0);
    float d = max(dot(dx, dx), dot(dy, dy));
    return floor(0.5 * log2(d) + 0.5);
}

vec4 mipmapLookup(vec2 uv) {
#ifdef GL_EXT_shader_texture_lod
    vec4 texInfo = texture2DLodEXT(texture, uv, min(mipLevel(vUv), 3.0));
#else
    float diff = min(mipLevel(vUv), 3.0) - (mipLevel(uv));
    vec4 texInfo = texture2D(texture, uv, diff);
#endif
    return texInfo;
}
