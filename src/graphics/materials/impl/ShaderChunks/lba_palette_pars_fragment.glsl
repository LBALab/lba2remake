#ifdef USE_INDEXED_COLORS
    uniform sampler2D palette;
    #ifdef USE_COLOR
        varying float vPalIndex;
    #endif
#endif
