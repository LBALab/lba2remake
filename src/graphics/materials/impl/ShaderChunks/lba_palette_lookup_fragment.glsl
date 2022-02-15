#ifdef USE_INDEXED_COLORS
    float lIntensity = length(reflectedLight.indirectDiffuse);
    float lOffset = lIntensity * 8.0 - 8.0;
    float x = mod(palIndex, 16.0) * 0.125 - 1.3;
    x += lIntensity;
    x *= 0.6;
    float y = floor(palIndex / 16.0) * 0.0625 + 0.03125;
    vec2 uvP = vec2(x, y);
    vec3 palColor1 = texture2D( palette, uvP ).rgb;
    // vec3 palColor2 = texture2D( palette, uvP + vec2(0.0625, 0.0) ).rgb;
    // vec3 palColor = mix(palColor1, palColor2, fract(uvPi.x + 0.5));
    vec3 palColor = palColor1;
    vec3 lightColor = reflectedLight.indirectDiffuse / lIntensity;
    diffuseColor.rgb = palColor;
    diffuseColor.a = 1.0;
    if (palIndex < 16.0) {
        diffuseColor.a = 0.0;
    }
    reflectedLight.indirectDiffuse = vec3(1.0);
#endif
// diffuseColor.rgb *= lightColor;
