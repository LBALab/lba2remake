import * as THREE from 'three';
import { each } from 'lodash';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../../../utils/shaders';
import { applyAnimationUpdaters } from './animations';
import Scene from '../../../Scene';
import { Time } from '../../../../datatypes';
import { getParams } from '../../../../params';
import { loadFx } from './fx/loader';
import Game from '../../../Game';
import { Fx } from './fx/Fx';

const exporter = new GLTFExporter();

export async function loadModel(file: string, useCache: boolean = false) : Promise<GLTF> {
    const model = await new Promise<GLTF>((resolve) => {
        const loader = new GLTFLoader();
        if (!useCache) {
            loader.setRequestHeader({ 'Cache-Control': 'no-cache' });
        }
        loader.load(file, (m) => {
            resolve(m);
        });
    });
    return model;
}

interface FullSceneModel {
    threeObject: THREE.Object3D;
    update: Function;
}

export async function loadFullSceneModel(
    entry: number,
    replacementData,
    isEditor: boolean,
    numActors: number
) : Promise<FullSceneModel> {
    const { game: gameId } = getParams();
    const model = await loadModel(`/models/${gameId}/iso_scenes/${entry}.glb`, !isEditor);
    const threeObject = model.scene.children[0];
    const effects: Fx[] = [];
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
            if (node.userData.fx) {
                const fx = loadFx(node, { numActors, ...replacementData });
                if (fx) {
                    effects.push(fx);
                    return;
                }
            }
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
                    uOpacity: {value: material.opacity},
                    lutTexture: {value: replacementData.lutTexture},
                    palette: {value: replacementData.paletteTexture},
                    light: {value: replacementData.light},
                    uNormalMatrix: {value: new THREE.Matrix3()}
                }
            });
            if (node.material.transparent) {
                node.renderOrder = 1;
            }
        }
    });
    const mixer = new THREE.AnimationMixer(threeObject);
    applyAnimationUpdaters(threeObject, model.animations);
    each(model.animations, (clip) => {
        mixer.clipAction(clip).play();
    });
    return {
        threeObject,
        update: (game: Game, scene: Scene, time: Time) => {
            mixer.update(time.delta);
            for (const fx of effects) {
                fx.update(game, scene, time);
            }
        }
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
            node.material = new THREE.MeshStandardMaterial({
                opacity: shaderMat.opacity,
                map: uTexture && uTexture.value
            });
        }
    });
    return new Promise((resolve) => {
        exporter.parse(threeObject, (gltf: ArrayBuffer) => {
            const { game } = getParams();
            // tslint:disable-next-line: no-console
            console.log(`Saving iso scene replacement ${entry} (${
                    (gltf.byteLength / 1e+6).toFixed(2)
                }Mb)...`);
            const req = new XMLHttpRequest();
            req.open('POST', `/iso_replacements/${game}/${entry}`, true);
            req.onload = () => {
                // tslint:disable-next-line: no-console
                console.log(`Saved iso scene replacement ${game} ${entry}.`);
                resolve();
            };
            req.setRequestHeader('Content-Type', 'application/octet-stream');
            req.send(new Blob([gltf]));
        }, {
            binary: true,
            embedImages: true,
            animations
        });
    });
}
