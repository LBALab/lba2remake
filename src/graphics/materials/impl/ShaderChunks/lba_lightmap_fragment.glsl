#ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vUv2 );
    reflectedLight.indirectDiffuse = lightMapTexel.rgb * lightMapIntensity;
#else
    reflectedLight.indirectDiffuse += vec3( 1.0 );
#endif
