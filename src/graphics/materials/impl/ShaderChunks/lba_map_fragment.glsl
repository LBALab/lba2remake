#ifdef USE_MAP
    #ifdef USE_TEXTURE_ATLAS
        #ifdef USE_ATLAS_ISLAND_MODE
            vec2 atlasDim = vec2(textureSize(map, 0));
            vec2 uv = (mod(vUv, vUvGroup.zw) + vUvGroup.xy) / atlasDim;
        #else
            vec2 uv = vUv / (vUvGroup.zw + 1.0);
        #endif
        vec4 texelColor = texture2D( map, uv );
        texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= texelColor;
    #else
        vec4 texelColor = texture2D( map, vUv );
        texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= texelColor;
    #endif
#endif
