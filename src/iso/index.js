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
    const bricksMap = loadBricksMap(layouts, bricks, palette);
    return {
        texture: bricksMap.texture,
        layouts: map(layouts, makeLayoutBuilder.bind(null, bricksMap))
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
        data: blocks
    };
}

function makeLayoutBuilder(bricksMap, layout) {
    return {
        build: function() {

        }
    };
}
