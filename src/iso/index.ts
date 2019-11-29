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
import { extractGridMetadata } from './metadata';

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
    const metadata = await loadMetadata(grid.library);

    return {
        props: {
            startPosition: [0, 0],
            envInfo: {
                skyColor: [0, 0, 0]
            }
        },
        threeObject: loadMesh(grid, entry, metadata),
        physics: {
            processCollisions: processCollisions.bind(null, grid),
            processCameraCollisions: () => null
        },

        update: () => {}
    };
}

async function loadMetadata(library) {
    const rawRD = await fetch('/metadata/layouts.json');
    const metadataAll = await rawRD.json();
    const libMetadata = metadataAll[library.index];
    const metadata = {};
    await Promise.all(map(libMetadata, async (data, idx) => {
        if (data.replace) {
            const model = await loadModel(data.file);
            metadata[idx] = {
                ...data,
                threeObject: model.scene
            };
        }
    }));
    return metadata;
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

function loadMesh(grid, entry, metadata) {
    const scene = new THREE.Object3D();
    const geometries = {
        positions: [],
        uvs: []
    };
    const { replacements } = extractGridMetadata(grid, metadata);
    each(replacements.objects, (threeObject) => {
        scene.add(threeObject);
    });

    let c = 0;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const o = grid.cells[c].build(geometries, x, z - 1, replacements.bricks);
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
        },
        side: THREE.DoubleSide
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
