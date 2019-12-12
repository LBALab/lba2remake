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
import {Side, OffsetBySide} from './mapping';

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

export async function loadIsometricScenery(entry, ambience) {
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
        threeObject: await loadMesh(grid, entry, metadata, ambience),
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
        } else if (data.mirror) {
            metadata[idx] = {...data};
        }
    }));
    return metadata;
}

interface GLTFModel {
    scene: THREE.Scene;
}

const loader = new GLTFLoader();
const models = {};

async function loadModel(file) : Promise<GLTFModel> {
    if (file in models) {
        return models[file];
    }
    const model = await new Promise<GLTFModel>((resolve) => {
        loader.load(`/models/layouts/${file}`, (m: GLTFModel) => {
            resolve(m);
        });
    });
    models[file] = model;
    return model;
}

async function loadMesh(grid, entry, metadata, ambience) {
    const scene = new THREE.Object3D();
    const geometries = {
        positions: [],
        uvs: []
    };
    const {library, cells} = grid;
    const gridMetadata = await extractGridMetadata(grid, metadata, ambience);
    each(gridMetadata.replacements.objects, (threeObject) => {
        scene.add(threeObject);
    });

    let c = 0;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            buildCell(
                library,
                cells[c].blocks,
                geometries,
                x,
                z - 1,
                gridMetadata
            );
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

function buildCell(library, blocks, geometries, x, z, gridMetadata) {
    const h = 0.5;
    const {positions, uvs} = geometries;
    const {width, height} = library.texture.image;
    const {replacements, mirrors} = gridMetadata;

    for (let yIdx = 0; yIdx < blocks.length; yIdx += 1) {
        const y = (yIdx * h) + h;
        if (blocks[yIdx]) {
            const layout = library.layouts[blocks[yIdx].layout];
            if (layout) {
                const key = `${x},${yIdx},${z}`;
                if (replacements.bricks.has(key))
                    continue;

                const block = layout.blocks[blocks[yIdx].block];
                if (block && block.brick in library.bricksMap) {
                    const {u, v} = library.bricksMap[block.brick];
                    const pushUv = (u0, v0, side) => {
                        const o = OffsetBySide[side];
                        uvs.push((u + u0 + o.x) / width, (v + v0 + o.y) / height);
                    };

                    positions.push(x, y, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x, y, z + 1);
                    pushUv(48, 11.5, Side.TOP);
                    positions.push(x + 1, y, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x, y, z);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x + 1, y, z + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x + 1, y, z);
                    pushUv(0, 11.5, Side.TOP);

                    positions.push(x + 1, y, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, y, z + 1);
                    pushUv(24, 23.5, Side.LEFT);
                    positions.push(x + 1, y - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, y, z);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, y - h, z + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, y - h, z);
                    pushUv(0, 26.5, Side.LEFT);

                    positions.push(x, y, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x + 1, y - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                    positions.push(x + 1, y, z + 1);
                    pushUv(24, 23.5, Side.RIGHT);
                    positions.push(x, y, z + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x, y - h, z + 1);
                    pushUv(48, 26.5, Side.RIGHT);
                    positions.push(x + 1, y - h, z + 1);
                    pushUv(24, 38.5, Side.RIGHT);

                    if (mirrors.has(key)) {
                        positions.push(x, y - h, z);
                        pushUv(24, -0.5, Side.TOP);
                        positions.push(x, y - h, z + 1);
                        pushUv(48, 11.5, Side.TOP);
                        positions.push(x + 1, y - h, z + 1);
                        pushUv(24, 23.5, Side.TOP);
                        positions.push(x, y - h, z);
                        pushUv(24, -0.5, Side.TOP);
                        positions.push(x + 1, y - h, z + 1);
                        pushUv(24, 23.5, Side.TOP);
                        positions.push(x + 1, y - h, z);
                        pushUv(0, 11.5, Side.TOP);

                        positions.push(x, y, z);
                        pushUv(0, 11.5, Side.LEFT);
                        positions.push(x, y, z + 1);
                        pushUv(24, 23.5, Side.LEFT);
                        positions.push(x, y - h, z + 1);
                        pushUv(24, 38.5, Side.LEFT);
                        positions.push(x, y, z);
                        pushUv(0, 11.5, Side.LEFT);
                        positions.push(x, y - h, z + 1);
                        pushUv(24, 38.5, Side.LEFT);
                        positions.push(x, y - h, z);
                        pushUv(0, 26.5, Side.LEFT);

                        positions.push(x, y, z);
                        pushUv(48, 11.5, Side.RIGHT);
                        positions.push(x + 1, y - h, z);
                        pushUv(24, 38.5, Side.RIGHT);
                        positions.push(x + 1, y, z);
                        pushUv(24, 23.5, Side.RIGHT);
                        positions.push(x, y, z);
                        pushUv(48, 11.5, Side.RIGHT);
                        positions.push(x, y - h, z);
                        pushUv(48, 26.5, Side.RIGHT);
                        positions.push(x + 1, y - h, z);
                        pushUv(24, 38.5, Side.RIGHT);
                    }
                }
            }
        }
    }
}
