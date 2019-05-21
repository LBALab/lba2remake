uniform sampler2D lutTexture;

vec3 lutLookupI(vec3 c, float intensity) {
    const vec2 uvScale = 1.0 / vec2(511.0, 1023.0);
    const float invU = 1.0 / 16.0;
    vec2 uv = vec2(
        c.r + mod(c.g, 16.0) * 32.0,
        c.b * 2.0 + floor(c.g * invU)
    ) * uvScale + vec2(0.0, intensity / 16.0);
    return texture(lutTexture, uv).rgb;
}

vec3 lutLookup(vec3 color, float intensity) {
    vec3 c = floor(color * 31.0);
    vec3 c0 = lutLookupI(c, floor(intensity));
    vec3 c1 = lutLookupI(c, ceil(intensity));
    return mix(c0, c1, fract(intensity));
}
