#ifdef USE_MAP
    #ifdef USE_TEXTURE_ATLAS
        // vec2 uv = (mod(vUv, vUvGroup.zw) + vUvGroup.xy) / 512.0;
        vec2 uv = vUv / (vUvGroup.zw + 1.0);
        vec4 texelColor = texture2D( map, uv );
        texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= texelColor;
    #else
        vec4 texelColor = texture2D( map, vUv );
        texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= texelColor;
    #endif
#endif
