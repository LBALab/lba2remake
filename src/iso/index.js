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
import {loadBricks} from './bricks';

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
