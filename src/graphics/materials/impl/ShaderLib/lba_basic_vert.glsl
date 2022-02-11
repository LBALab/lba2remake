#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <uvgroup_pars_vertex>
#include <envmap_pars_vertex>
#ifndef USE_INDEXED_COLORS
    #include <color_pars_vertex>
#endif
#include <lba_palette_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
    #include <uv_vertex>
    #include <uv2_vertex>
    #include <uvgroup_vertex>
    #ifndef USE_INDEXED_COLORS
        #include <color_vertex>
    #endif
    #include <lba_palette_vertex>
    #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
        #include <skinbase_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
    #endif
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <fog_vertex>
}
