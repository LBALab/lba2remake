#if defined(USE_MAP) && defined(USE_COLOR)
    vec4 texelColor = texture2D( map, vUv );
    texelColor = mapTexelToLinear( texelColor );
    vec3 mixedColor = mix(vColor.rgb, texelColor.rgb, texelColor.a);
    diffuseColor *= vec4(mixedColor, 1.0);
#endif
