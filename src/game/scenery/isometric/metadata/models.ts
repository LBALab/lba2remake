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
import { createTwinklingStar } from '../misc/twinkling_star';

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
                if (node.userData.render_order) {
                    node.renderOrder = node.userData.render_order;
                }
                return;
            }
            const texture = material.map;
            let fx;
            if (node.userData.fx) {
                fx = loadFx(node, { numActors, ...replacementData });
            }
            if (fx) {
                effects.push(fx);
            } else {
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
                if (texture) {
                    texture.encoding = THREE.LinearEncoding;
                }
            }
            if (node.userData.render_order) {
                node.renderOrder = node.userData.render_order;
            } else if (node.material.transparent) {
                node.renderOrder = 1;
            }
        }
    });

    if (entry === 117) {
        // Twinkling star effects for entry 117 (scene 173, Kurtz house)
        // Specs: pos (Vector3), size (scale), color (hex Color), speed (twinkle rate)
        const starSpecs = [
            {
                pos: new THREE.Vector3(41.3, 3.85, 35),
                size: 1.0,
                color: 0xefb810,
                speed: 1.514
            },
            {
                pos: new THREE.Vector3(41.17, 3.4, 35.5),
                size: 0.6,
                color: 0x3c341e,
                speed: 1.259
            }
            // Add more stars by adding additional objects to this array.
        ];

        for (const spec of starSpecs) {
            const { pos, size, color, speed } = spec;
            // Create a twinkling star (defined in ../misc/twinkling_star.ts)
            const starEffect = await createTwinklingStar(
                pos,
                new THREE.Color(color),
                size,
                speed
            );
            // Add the star's mesh to the scene
            threeObject.add(starEffect.threeObject);
            // Register the star's update function to animate its twinkle each frame
            effects.push({
                init: () => {}, // no extra initialization needed
                update: (_game, _scene, time) => {
                    starEffect.update(time); // update star effect (uses time.elapsed in shader)
                }
            });
        }
    }

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

export async function saveFullSceneModel(replacements, entry): Promise<void> {
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
                map: uTexture?.value || null
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
        }, undefined, {
            binary: true,
            embedImages: true,
            animations
        });
    });
}
