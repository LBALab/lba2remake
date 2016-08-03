import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {prepareGeometries} from './geometries';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadSea} from './sea';
import {loadObjects} from './objects';
import {loadTexture} from '../texture';

export function loadIsland({name, skyIndex, skyColor}, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        ile: loadHqrAsync(`${name}.ILE`),
        obl: loadHqrAsync(`${name}.OBL`)
    }, function(err, files) {
        callback(loadIslandSync(files, skyIndex, skyColor));
    });
}

function loadIslandSync(files, skyIndex, skyColor) {
    const island = {
        files: files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        layout: loadLayout(files.ile),
        skyIndex: skyIndex,
        skyColor: skyColor
    };

    const object = new THREE.Object3D();

    const geometries = loadGeometries(island);
    _.each(geometries, ({positions, uvs, colors, uvGroups, material}, name) => {
        if (positions && positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            if (uvs) {
                bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, true));
            }
            if (colors) {
                bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 4, true));
            }
            if (uvGroups) {
                bufferGeometry.addAttribute('uvGroup', new THREE.BufferAttribute(new Uint8Array(uvGroups), 4, true));
            }
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.name = name;
            object.add(mesh);
        }
    });

    const sky = new THREE.Mesh(new THREE.PlaneGeometry(128, 128, 1, 1), geometries.sky.material);
    sky.rotateX(Math.PI / 2.0);
    sky.position.y = 2.0;
    object.add(sky);

    return object;
}

function loadGeometries(island) {
    const geometries = prepareGeometries(island);
    const usedTiles = {};
    const objects = [];

    _.each(island.layout.groundSections, section => {
        const tilesKey = [section.x, section.z].join(',');
        usedTiles[tilesKey] = [];
        loadGround(island, section, geometries, usedTiles[tilesKey]);
        loadObjects(island, section, geometries, objects);
    });

    _.each(island.layout.seaSections, section => {
        const xd = Math.floor(section.x / 2);
        const zd = Math.floor(section.z / 2);
        const offsetX = 1 - Math.abs(section.x % 2);
        const offsetZ = Math.abs(section.z % 2);
        const tilesKey = [xd, zd].join(',');
        loadSea(section, geometries, usedTiles[tilesKey], offsetX, offsetZ, island.skyIndex);
    });

    return geometries;
}
