vec4 colorFromPalette(vec4 texInfo, float colorIndex) {
    return dither(vec2(mod(colorIndex * 256.0, 16.0) / 16.0 + vColorInfo.x / 32.0 - 0.5, floor(colorIndex * 16.0) / 16.0));
    //return texture2D(palette, vec2(mod(colorIndex * 256.0, 16.0) / 16.0 + vColorInfo.x / 32.0 - 0.5, floor(colorIndex * 16.0) / 16.0));
}

vec4 texture2DPal(vec4 texInfo, vec2 uv) {
    vec2 itrp = floor(fract(uv * 128.0) * 2.0);
    vec4 a = colorFromPalette(texInfo, texInfo[0]);
    vec4 b = colorFromPalette(texInfo, texInfo[1]);
    vec4 c = colorFromPalette(texInfo, texInfo[2]);
    vec4 d = colorFromPalette(texInfo, texInfo[3]);
    float xPos = itrp.x;
    float yPos = itrp.y;
    float xNeg = 1.0 - itrp.x;
    float yNeg = 1.0 - itrp.y;
    //return vec4(xPos, yPos, 0.0, 1.0);
    return  a * xNeg * yNeg +
            b * xPos * yNeg +
            c * xNeg * yPos +
            d * xPos * yPos;
}
