import THREE from 'three';
import {loadTexture} from '../texture';

import colored_vertex from './shaders/colored.vert.glsl';
import colored_fragment from './shaders/colored.frag.glsl';
import textured_vertex from './shaders/textured.vert.glsl';
import textured_fragment from './shaders/textured.frag.glsl';
import atlas_vertex from './shaders/atlas.vert.glsl';
import atlas_fragment from './shaders/atlas.frag.glsl';

export function prepareGeometries(island) {
    return {
        colored: {
            positions: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: colored_vertex,
                fragmentShader: colored_fragment
            })
        },
        textured: {
            positions: [],
            colors: [],
            uvs: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: textured_vertex,
                fragmentShader: textured_fragment,
                uniforms: {
                    texture: {value: loadTexture(island.files.ile.getEntry(1), island.palette)}
                }
            })
        },
        atlas: {
            positions: [],
            colors: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: atlas_vertex,
                fragmentShader: atlas_fragment,
                uniforms: {
                    texture: {value: loadTexture(island.files.ile.getEntry(2), island.palette)}
                }
            })
        }
    };
}
