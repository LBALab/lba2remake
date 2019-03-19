vec4 dither(float color, float intensity) {
    float nz = texture(noise, vec2(vPosition.x, vPosition.z) * 0.5).a;
    float offset = (nz - 0.5) * 2.0;
    float fintensity = floor(intensity) + offset;
    vec2 uvb = vec2(fintensity, color) * 0.0625;
    vec2 uvn = vec2(fintensity + 1.0, color) * 0.0625;
    vec4 base = texture(palette, uvb);
    vec4 next = texture(palette, uvn);
    // return vec4(vec3(nz), 1.0);
    return mix(base, next, fract(intensity));
}
