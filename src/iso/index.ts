import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { map, each } from 'lodash';

import { loadHqr } from '../hqr';
import { loadBricks } from './bricks';
import { loadGrid } from './grid';
import { processCollisions } from '../game/loop/physicsIso';
import {compile} from '../utils/shaders';
import brick_vertex from './shaders/brick.vert.glsl';
import brick_fragment from './shaders/brick.frag.glsl';
import { extractGridReplacements } from './replacements';

export async function loadImageData(src) : Promise<ImageData> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function onload() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            resolve(context.getImageData(0, 0, img.width, img.height));
        };
        img.src = src;
    });
}

export async function loadIsometricScenery(entry) {
    const [ress, bkg, mask] = await Promise.all([
        loadHqr('RESS.HQR'),
        loadHqr('LBA_BKG.HQR'),
        loadImageData('images/brick_mask.png')
    ]);
    const palette = new Uint8Array(ress.getEntry(0));
    const bricks = loadBricks(bkg);
    const grid = loadGrid(bkg, bricks, mask, palette, entry + 1);
    const replacements = await loadReplacements(grid.library);

    return {
        props: {
            startPosition: [0, 0],
            envInfo: {
                skyColor: [0, 0, 0]
            }
        },
        threeObject: loadMesh(grid, entry, replacements),
        physics: {
            processCollisions: processCollisions.bind(null, grid),
            processCameraCollisions: () => null
        },

        update: () => {}
    };
}

async function loadReplacements(library) {
    const rawRD = await fetch('/metadata/layout_replacements.json');
    const replacementDataAll = await rawRD.json();
    const replacementData = replacementDataAll[library.index];
    const replacements = {};
    await Promise.all(map(replacementData, async (data, idx) => {
        const model = await loadModel(data.file);
        replacements[idx] = {
            ...data,
            threeObject: model.scene
        };
    }));
    return replacements;
}

interface GLTFModel {
    scene: THREE.Scene;
}

const loader = new GLTFLoader();

async function loadModel(file) : Promise<GLTFModel> {
    return new Promise((resolve) => {
        loader.load(`/models/layouts/${file}`, resolve);
    });
}

function loadMesh(grid, entry, replacements) {
    const scene = new THREE.Object3D();
    const geometries = {
        positions: [],
        uvs: []
    };
    const gridReps = extractGridReplacements(grid, replacements);
    each(gridReps.objects, (threeObject) => {
        scene.add(threeObject);
    });

    let c = 0;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const o = grid.cells[c].build(geometries, x, z - 1, gridReps.bricks);
            if (o) {
                scene.add(o);
            }
            c += 1;
        }
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(geometries.positions), 3)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2)
    );
    const mesh = new THREE.Mesh(bufferGeometry, new THREE.RawShaderMaterial({
        vertexShader: compile('vert', brick_vertex),
        fragmentShader: compile('frag', brick_fragment),
        transparent: true,
        uniforms: {
            library: {value: grid.library.texture}
        }
    }));

    mesh.frustumCulled = false;
    mesh.name = 'iso_grid';

    scene.add(mesh);

    const scale = 0.75;
    scene.name = `scenery_iso_${entry}`;
    scene.scale.set(scale, scale, scale);
    scene.position.set(48, 0, 0);
    scene.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    return scene;
}
