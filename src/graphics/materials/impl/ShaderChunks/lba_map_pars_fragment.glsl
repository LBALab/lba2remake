#ifdef USE_MAP
    #ifdef USE_TEXTURE_ATLAS
        vec4 textureMipMap(sampler2D s, vec2 uv) {
            #if __VERSION__ == 300
                vec2 dx = dFdx(vUv);
                vec2 dy = dFdy(vUv);
                float d = max(dot(dx, dx), dot(dy, dy));
                float level = floor(0.5 * log2(d) + 0.5);
                return textureLod(s, uv, min(level, 3.0));
            #else
                #if defined(GL_EXT_shader_texture_lod) && defined(GL_OES_standard_derivatives)
                    vec2 dx = dFdx(vUv);
                    vec2 dy = dFdy(vUv);
                    float d = max(dot(dx, dx), dot(dy, dy));
                    float level = floor(0.5 * log2(d) + 0.5);
                    return texture2DLodEXT(s, uv, min(level, 3.0));
                #else
                    return texture(s, uv);
                #endif
            #endif
        }
    #endif
#endif
