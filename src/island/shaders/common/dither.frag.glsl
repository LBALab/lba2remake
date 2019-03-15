vec4 dither(float color, float intensity) {
    float nz = texture(noise, vec2(vPosition.x, vPosition.z) * 0.25).a;
    float offset = (nz - 0.5);
    float fintensity = floor(intensity) + offset * 0.0625;
    vec2 uvb = vec2(fintensity, color) * 0.0625;
    vec2 uvn = vec2(fintensity + 1.0, color) * 0.0625;
    vec4 base = texture(palette, uvb);
    vec4 next = texture(palette, uvn);
    return mix(base, next, fract(intensity) + offset * 2.0);
}
