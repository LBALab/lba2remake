#ifdef USE_MAP
    #ifdef USE_TEXTURE_ATLAS
        #ifdef USE_ATLAS_ISLAND_MODE
            vec2 atlasDim = vec2(textureSize(map, 0));
            vec2 uv = (mod(vUv, vUvGroup.zw) + vUvGroup.xy) / atlasDim;
        #else
            vec2 uv = vUv / (vUvGroup.zw + 1.0);
        #endif
        vec4 texelColor = textureMipMap( map, uv );
    #else
        vec4 texelColor = texture2D( map, vUv );
    #endif
    #ifdef USE_INDEXED_COLORS
        float palIndex = texelColor.r * 255.0;
    #else
        texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= texelColor;
    #endif
#endif
