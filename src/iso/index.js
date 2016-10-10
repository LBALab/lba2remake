import async from 'async';
import THREE from 'three';
import {map} from 'lodash';
import {loadHqrAsync} from '../hqr';
import {bits} from '../utils';
import {loadBricks} from './bricks';
import {loadBricksMap} from './map';

export function loadIsoSceneManager() {
    const scene = {
        data: {
            update: () => {
            },
            physics: {
                getGroundHeight: () => 0
            },
            threeScene: new THREE.Object3D()
        }
    };
    loadScene(threeScene => {
        scene.data.threeScene = threeScene;
    });
    return {
        currentScene: () => scene
    }
}

export function loadScene(callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function (err, files) {
        const bricks = loadBricks(files.bkg);
        const palette = new Uint8Array(files.ress.getEntry(0));
        const library = loadLibrary(files.bkg, bricks, palette, 179);
        let idx = 53;

        function buildScene() {
            console.log('Layout: ', idx);
            const geometries = {
                positions: [],
                uvs: []
            };
            library.layouts[idx].build(geometries);

            const scene = new THREE.Scene();
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometries.positions), 3));
            bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometries.uvs), 2));
            const mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({
                map: library.texture,
                depthTest: false
            }));
            scene.add(mesh);
            return scene;
        }

        callback(buildScene());

        window.addEventListener('keydown', function(event) {
            if (event.code == 'PageUp') {
                idx = idx - 1 >= 0 ? idx - 1 : library.layouts.length - 1;
                callback(buildScene());
            } else if (event.code == 'PageDown') {
                idx = (idx + 1) % library.layouts.length;
                callback(buildScene());
            }
        });
    });
}

function loadLibrary(bkg, bricks, palette, entry) {
    const buffer = bkg.getEntry(entry);
    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;
    const layouts = [];
    for (let i = 0; i < numLayouts; ++i) {
        const offset = dataView.getUint32(i * 4, true);
        const nextOffset = i == numLayouts - 1 ? dataView.byteLength : dataView.getUint32((i + 1) * 4, true);
        const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
        layouts.push(loadLayout(layoutDataView));
    }
    const bricksMap = loadBricksMap(layouts, bricks, palette);
    return {
        texture: bricksMap.texture,
        layouts: map(layouts, makeLayoutBuilder.bind(null, bricksMap.map))
    };
}

function loadLayout(dataView) {
    const nX = dataView.getUint8(0);
    const nY = dataView.getUint8(1);
    const nZ = dataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const blocks = [];
    const offset = 3;
    for (let i = 0; i < numBricks; ++i) {
        const type = dataView.getUint8(offset + i * 4 + 1);
        blocks.push({
            shape: dataView.getUint8(offset + i * 4),
            sound: bits(type, 0, 4),
            groundType: bits(type, 4, 4),
            brick: dataView.getUint16(offset + i * 4 + 2, true)
        });
    }
    return {
        nX: nX,
        nY: nY,
        nZ: nZ,
        blocks: blocks
    };
}

function makeLayoutBuilder(bricksMap, layout) {
    const blocks = layout.blocks;
    return {
        build: function({positions, uvs}) {
            console.log('Layout blocks:', blocks.length);
            let i = 0;
            for (let x = 0; x < layout.nX; ++x) {
                for (let y = 0; y < layout.nY; ++y) {
                    for (let z = 0; z < layout.nZ; ++z) {
                        if (blocks[i].brick) {
                            const offset = bricksMap[blocks[i].brick];
                            const u = offset.x;
                            const v = offset.y;

                            // First triangle
                            positions.push(x * 48, z * 38, 0);
                            uvs.push(u / 1024, v / 1024);

                            positions.push((x + 1) * 48, z * 38, 0);
                            uvs.push((u + 48) / 1024, v / 1024);

                            positions.push((x + 1) * 48, (z + 1) * 38, 0);
                            uvs.push((u + 48) / 1024, (v + 38) / 1024);

                            // Second triangle
                            positions.push(x * 48, z * 38, 0);
                            uvs.push(u / 1024, v / 1024);

                            positions.push((x + 1) * 48, (z + 1) * 38, 0);
                            uvs.push((u + 48) / 1024, (v + 38) / 1024);

                            positions.push(x * 48, (z + 1) * 38, 0);
                            uvs.push(u / 1024, (v + 38) / 1024);
                        }
                        i++;
                    }
                }
            }
        }
    };
}

