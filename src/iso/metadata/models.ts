import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../utils/shaders';

const loader = new GLTFLoader();
const exporter = new GLTFExporter();

const modelsCache = {};

export async function loadModel(file: string, useCache: boolean = false) : Promise<THREE.Object3D> {
    if (useCache && file in modelsCache) {
        return modelsCache[file];
    }
    const model = await new Promise<THREE.Object3D>((resolve) => {
        loader.load(file, (m) => {
            resolve(m.scene);
        });
    });
    if (useCache) {
        modelsCache[file] = model;
    }
    return model;
}

export async function loadFullSceneModel(entry: number, replacementData) : Promise<THREE.Object3D> {
    const model = await loadModel(`/models/iso_scenes/${entry}.glb`);
    const threeObject = model.children[0];
    threeObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const color_attr = (node.geometry as THREE.BufferGeometry).attributes.color;
            if (color_attr) {
                color_attr.normalized = true;
            }
            const texture = (node.material as THREE.MeshStandardMaterial).map;
            node.material = new THREE.RawShaderMaterial({
                vertexShader: compile('vert', texture
                    ? VERT_OBJECTS_TEXTURED
                    : VERT_OBJECTS_COLORED),
                fragmentShader: compile('frag', texture
                    ? FRAG_OBJECTS_TEXTURED
                    : FRAG_OBJECTS_COLORED),
                uniforms: {
                    uTexture: texture && { value: texture },
                    lutTexture: {value: replacementData.lutTexture},
                    palette: {value: replacementData.paletteTexture},
                    light: {value: replacementData.light}
                }
            });
        }
    });
    return threeObject;
}

export async function saveFullSceneModel(threeObject, entry) {
    const savedObject = threeObject.clone(true);
    savedObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const material = node.material as THREE.RawShaderMaterial;
            const uTexture = material.uniforms.uTexture;
            node.material = new THREE.MeshStandardMaterial(uTexture && {
                map: uTexture.value
            });
        }
    });
    exporter.parse(savedObject, (gltf: ArrayBuffer) => {
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
        embedImages: true
    });
}
