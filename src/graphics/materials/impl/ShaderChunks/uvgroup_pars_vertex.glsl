#ifdef USE_TEXTURE_ATLAS
    varying vec4 vUvGroup;
    #ifdef USE_ATLAS_ISLAND_MODE
        attribute vec2 texcoord_2;
        attribute vec2 texcoord_3;
    #else
        attribute vec4 uvgroup;
    #endif
#endif
