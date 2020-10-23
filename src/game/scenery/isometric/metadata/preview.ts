import * as THREE from 'three';
import VERT_OBJECTS_COLORED_PREVIEW from '../shaders/objects/colored.preview.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED_PREVIEW from '../shaders/objects/textured.preview.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../../../utils/shaders';

export async function replaceMaterialsForPreview(threeObject, shaderData) {
    const {lutTexture, paletteTexture, light} = shaderData;
    threeObject.traverse((node) => {
        node.updateMatrix();
        node.updateMatrixWorld(true);
        if (node instanceof THREE.Mesh) {
            const normalMatrix = new THREE.Matrix3();
            normalMatrix.setFromMatrix4(node.matrixWorld);
            const material = node.material as THREE.MeshStandardMaterial;
            if (material.name.substring(0, 8) === 'keepMat_') {
                return;
            }
            if (material.map) {
                node.material = new THREE.RawShaderMaterial({
                    vertexShader: compile('vert', VERT_OBJECTS_TEXTURED_PREVIEW),
                    fragmentShader: compile('frag', FRAG_OBJECTS_TEXTURED),
                    uniforms: {
                        uNormalMatrix: {value: normalMatrix},
                        uTexture: {value: material.map},
                        lutTexture: {value: lutTexture},
                        palette: {value: paletteTexture},
                        light: {value: light}
                    }
                });
            } else {
                const mColor = material.color.clone().convertLinearToGamma();
                const color = new THREE.Vector4().fromArray(
                    [...mColor.toArray(), material.opacity]
                );
                node.material = new THREE.RawShaderMaterial({
                    transparent: material.opacity < 1,
                    vertexShader: compile('vert', VERT_OBJECTS_COLORED_PREVIEW),
                    fragmentShader: compile('frag', FRAG_OBJECTS_COLORED),
                    uniforms: {
                        uNormalMatrix: {value: normalMatrix},
                        uColor: {value: color},
                        lutTexture: {value: lutTexture},
                        palette: {value: paletteTexture},
                        light: {value: light}
                    }
                });
            }
        }
    });
}
