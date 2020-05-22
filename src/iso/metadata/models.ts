import * as THREE from 'three';
import { each } from 'lodash';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../utils/shaders';

const loader = new GLTFLoader();
const exporter = new GLTFExporter();

const modelsCache = {};

export async function loadModel(file: string, useCache: boolean = false) : Promise<GLTF> {
    if (useCache && file in modelsCache) {
        return modelsCache[file];
    }
    const model = await new Promise<GLTF>((resolve) => {
        loader.load(file, (m) => {
            resolve(m);
        });
    });
    if (useCache) {
        modelsCache[file] = model;
    }
    return model;
}

interface FullSceneModel {
    threeObject: THREE.Object3D;
    mixer: THREE.AnimationMixer;
}

export async function loadFullSceneModel(entry: number, replacementData) : Promise<FullSceneModel> {
    const model = await loadModel(`/models/iso_scenes/${entry}.glb`);
    const threeObject = model.scene.children[0];
    threeObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const color_attr = (node.geometry as THREE.BufferGeometry).attributes.color;
            if (color_attr) {
                color_attr.normalized = true;
            }
            const material = (node.material as THREE.MeshStandardMaterial);
            if (material.name.substring(0, 8) === 'keepMat_') {
                return;
            }
            const texture = material.map;
            node.material = new THREE.RawShaderMaterial({
                vertexShader: compile('vert', texture
                    ? VERT_OBJECTS_TEXTURED
                    : VERT_OBJECTS_COLORED),
                fragmentShader: compile('frag', texture
                    ? FRAG_OBJECTS_TEXTURED
                    : FRAG_OBJECTS_COLORED),
                transparent: node.name.substring(0, 12) === 'transparent_',
                uniforms: {
                    uTexture: texture && { value: texture },
                    lutTexture: {value: replacementData.lutTexture},
                    palette: {value: replacementData.paletteTexture},
                    light: {value: replacementData.light}
                }
            });
            if (node.material.transparent) {
                node.renderOrder = 1;
            }
        }
    });
    const mixer = new THREE.AnimationMixer(threeObject);
    each(model.animations, (clip) => {
        mixer.clipAction(clip).play();
    });
    return {
        threeObject,
        mixer
    };
}

export async function saveFullSceneModel(replacements, entry) {
    const { threeObject, animations } = replacements;
    threeObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const material = node.material;
            if (material instanceof THREE.MeshStandardMaterial) {
                return;
            }
            const shaderMat = material as THREE.RawShaderMaterial;
            if (shaderMat.name.substring(0, 8) === 'keepMat_') {
                return;
            }
            const uTexture = shaderMat.uniforms.uTexture;
            node.material = new THREE.MeshStandardMaterial(uTexture && {
                map: uTexture.value
            });
        }
    });
    exporter.parse(threeObject, (gltf: ArrayBuffer) => {
        // tslint:disable-next-line: no-console
        console.log(`Saving iso scene replacement ${entry} (${
                (gltf.byteLength / 1e+6).toFixed(2)
            }Mb)...`);
        const req = new XMLHttpRequest();
        req.open('POST', `/iso_replacements/${entry}`, true);
        req.onload = () => {
            // tslint:disable-next-line: no-console
            console.log(`Saved iso scene replacement ${entry}.`);
        };
        req.setRequestHeader('Content-Type', 'application/octet-stream');
        req.send(new Blob([gltf]));
    }, {
        binary: true,
        embedImages: true,
        animations
    });
}
