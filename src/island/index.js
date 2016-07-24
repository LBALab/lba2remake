import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {prepareGeometries} from './geometries';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadObjects} from './objects';
import {loadTexture} from '../texture';

export default function loadIsland({name, skyIndex}, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        ile: loadHqrAsync(`${name}.ILE`),
        obl: loadHqrAsync(`${name}.OBL`)
    }, function(err, files) {
        callback(loadIslandSync(files, skyIndex));
    });
}

function loadIslandSync(files, skyIndex) {
    const island = {
        files: files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        layout: loadLayout(files.ile),
        skyIndex: skyIndex
    };

    const object = new THREE.Object3D();

    const geometries = loadGeometries(island);
    _.each(geometries, ({positions, uvs, colors, uvGroups, material}) => {
        if (positions) {
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
            object.add(new THREE.Mesh(bufferGeometry, material));
        }
    });

    const sea = new THREE.Mesh(new THREE.PlaneGeometry(128, 128, 1, 1), geometries.sea.material);
    sea.rotateX(-Math.PI / 2.0);
    sea.position.y = -0.001;
    object.add(sea);

    return object;
}

function loadGeometries(island) {
    const geometries = prepareGeometries(island);

    const objects = [];
    _.each(island.layout, section => {
        loadGround(island, section, geometries);
        loadObjects(island, section, geometries, objects);
    });
    return geometries;
}
