#ifdef USE_TEXTURE_ATLAS
    #ifdef USE_ATLAS_ISLAND_MODE
        vUvGroup = vec4(texcoord_2, texcoord_3);
    #else
        vUvGroup = uvgroup;
    #endif
#endif
