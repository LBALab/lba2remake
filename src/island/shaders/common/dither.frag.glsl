uniform sampler2D palette;
uniform sampler2D noise;

vec4 dither(float color, float intensity) {
    const vec2 halfPixV = vec2(0.0, 0.03125);
    float nz = texture(noise, vec2(vPosition.x * worldScale, vPosition.z * worldScale) * 0.5).a;
    float offset = (nz - 0.5) * 2.0;
    float fintensity = floor(intensity) + offset;
    vec2 uvb = vec2(fintensity, color) * 0.0625;
    vec2 uvn = vec2(fintensity + 1.0, color) * 0.0625;
    vec4 base = texture(palette, uvb + halfPixV);
    vec4 next = texture(palette, uvn + halfPixV);
    // return vec4(vec3(nz), 1.0);
    return mix(base, next, fract(intensity));
}
