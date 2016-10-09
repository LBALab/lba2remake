import async from 'async';
import {
    map,
    filter,
    flatten,
    uniq,
    each
} from 'lodash';
import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import {bits} from '../utils';

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
    loadScene(texture => {
        const tScene = new THREE.Scene();
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1024, 1024, 1, 1), new THREE.MeshBasicMaterial({
            map: texture
        }));
        plane.position.z = -0.7;
        plane.position.y = 0.5;
        tScene.add(plane);
        scene.data.threeScene = tScene;
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
        console.log(library);
        callback(library.texture);
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
    return loadBricksMap(layouts, bricks, palette);
}

function loadBricksMap(layouts, bricks, palette) {
    const usedBricks = filter(
        uniq(
            flatten(
                map(layouts, layout => map(layout, block => block.brick))
            )
        ),
        idx => idx != 0
    );
    const brickMap = {};
    const image_data = new Uint8Array(1024 * 1024 * 4);
    each(usedBricks, (brick, idx) => {
        const offsetX = (idx % 21) * 48;
        const offsetY = Math.round(idx / 21) * 38;
        brickMap[brick] = {
            x: offsetX,
            y: offsetY
        };
        const pixels = bricks[brick - 1];
        for (let y = 0; y < 38; ++y) {
            for (let x = 0; x < 48; ++x) {
                const src_i = y * 48 + x;
                const tgt_i = (y + offsetY) * 1024 + x + offsetX;
                image_data[tgt_i * 4] = palette[pixels[src_i] * 3];
                image_data[tgt_i * 4 + 1] = palette[pixels[src_i] * 3 + 1];
                image_data[tgt_i * 4 + 2] = palette[pixels[src_i] * 3 + 2];
                image_data[tgt_i * 4 + 3] = 0xFF;
            }
        }
    });
    const texture = new THREE.DataTexture(
        image_data,
        1024,
        1024,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return {
        texture: texture,
        map: brickMap
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
    return blocks;
}

function loadBricks(bkg) {
    const bricks = [];
    for (let i = 197; i <= 18099; ++i) {
        bricks.push(loadBrick(bkg, i));
    }
    return bricks;
}

function loadBrick(bkg, entry) {
    const dataView = new DataView(bkg.getEntry(entry));
    const height = dataView.getUint8(1);
    const offsetX = dataView.getUint8(2);
    const offsetY = dataView.getUint8(3);
    const buffer = new ArrayBuffer(48 * 38);
    const pixels = new Uint8Array(buffer);
    let ptr = 4;
    for (let y = 0; y < height; ++y) {
        const numRuns = dataView.getUint8(ptr++);
        let x = 0;
        const offset = () => (y + offsetY) * 48 + x + offsetX;
        for (let run = 0; run < numRuns; ++run) {
            const runSpec = dataView.getUint8(ptr++);
            const runLength = bits(runSpec, 0, 6) + 1;
            const type = bits(runSpec, 6, 2);
            if (type == 2) {
                const color = dataView.getUint8(ptr++);
                for (let i = 0; i < runLength; ++i) {
                    pixels[offset()] = color;
                    x++;
                }
            }
            else if (type == 1 || type == 3) {
                for (let i = 0; i < runLength; ++i) {
                    pixels[offset()] = dataView.getUint8(ptr++);
                    x++;
                }
            }
            else {
                x += runLength;
            }
        }
    }
    return pixels;
}
