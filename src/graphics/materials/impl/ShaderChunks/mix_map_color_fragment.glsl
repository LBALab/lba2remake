#if defined(USE_MAP) && defined(USE_COLOR)
    vec4 texelColor = texture2D( map, vUv );
    #ifdef USE_INDEXED_COLORS
        float a = 1.0;
        if (texelColor.r <= 0.00001) {
            a = 0.0;
        }
        float palIndex = mix(vPalIndex, texelColor.r * 255.0, a);
    #else
        // texelColor = mapTexelToLinear( texelColor );
        vec3 mixedColor = mix(vColor.rgb, texelColor.rgb, texelColor.a);
        diffuseColor *= vec4(mixedColor, 1.0);
    #endif
#endif
