highp vec2 rand(vec3 co) {
    highp vec3 a = vec3(12.9898, 3.9898, 78.233);
    highp float b = 43758.5453;
    highp float sn1 = mod(dot(floor(co), a), 3.14159);
    highp float sn2 = mod(dot(floor(co * 2.0), a), 3.14159);
    return fract(sin(vec2(sn1, sn2)) * b) * 2.0 - 1.0;
}

vec4 dither(vec2 uv) {
    float bias = clamp(max(length(dFdx(vPos)), length(dFdy(vPos))) * 900.0, 0.0, 1.0);
    float level = pow(2.0, 12.0 - floor(bias * 5.0));
    vec2 vnoise = rand(vPos * level);
    float noise = mix(vnoise[0], vnoise[1], 1.0 - fract(bias * 5.0));
    uv.x = uv.x + noise * 0.0625 * 0.6 * (2.0 - bias);
    uv += 0.03125;
    return texture2D(palette, uv);
}
