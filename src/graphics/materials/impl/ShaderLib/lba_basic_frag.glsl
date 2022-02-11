uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
    varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#ifndef USE_INDEXED_COLORS
    #include <color_pars_fragment>
#endif
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <uvgroup_pars_fragment>
#include <map_pars_fragment>
#include <lba_map_pars_fragment>
#include <lba_palette_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
    #include <clipping_planes_fragment>
    vec4 diffuseColor = vec4( diffuse, opacity );
    #include <logdepthbuf_fragment>
    #ifdef USE_MIX_MAP_COLOR
        #include <mix_map_color_fragment>
    #else
        #include <lba_map_fragment>
        #ifndef USE_INDEXED_COLORS
            #include <color_fragment>
        #endif
    #endif
    #include <lba_palette_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    // accumulation (baked indirect lighting only)
    #include <lba_lightmap_fragment>
    // modulation
    #include <aomap_fragment>
    #include <lba_palette_lookup_fragment>

    reflectedLight.indirectDiffuse *= diffuseColor.rgb;

    vec3 outgoingLight = reflectedLight.indirectDiffuse;

    #include <envmap_fragment>

    #include <output_fragment>
    #include <tonemapping_fragment>
    #ifndef USE_INDEXED_COLORS
        #include <encodings_fragment>
    #endif
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}
