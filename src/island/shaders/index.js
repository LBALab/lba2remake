import colored_vert from './colored.vert.glsl';
import colored_frag from './colored.frag.glsl';
import textured_vert from './textured.vert.glsl';
import textured_frag from './textured.frag.glsl';
import atlas_textured_vert from './atlas_textured.vert.glsl';
import atlas_textured_frag from './atlas_textured.frag.glsl';

export default {
    colored: {
        vert: colored_vert,
        frag: colored_frag
    },
    textured: {
        vert: textured_vert,
        frag: textured_frag
    },
    atlas_textured: {
        vert: atlas_textured_vert,
        frag: atlas_textured_frag
    }
};
