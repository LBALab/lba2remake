import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {prepareGeometries} from './geometries';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadSea} from './sea';
import {loadObjects} from './objects';
import {loadIslandPhysics} from './physics';

import islandsInfo from './data/islands';
import environments from './data/environments';

export function loadIslandManager() {
    const islands = _.map(islandsInfo, island => {
        return _.assign({
            envInfo: environments[island.env]
        }, island);
    });

    const len = islands.length;
    let idx = -1;

    const islandManager = {
        currentIsland: () => idx >= 0 ? islands[idx] : null
    };

    islandManager.loadNext = function(callback) {
        idx = (idx + 1) % len;
        loadIsland(islands[idx], callback);
        return islands[idx];
    };

    islandManager.loadPrevious = function(callback) {
        idx = (idx - 1 >= 0) ? idx - 1 : len - 1;
        loadIsland(islands[idx], callback);
        return islands[idx];
    };

    islandManager.loadIsland = function(name, callback) {
        const island = _.find(islands, i => i.name == name);
        idx = islands.indexOf(island);
        loadIsland(island, callback);
        return island;
    };

    return islandManager;
}

export function loadIsland(island, callback) {
    if (island.data) {
        setTimeout(callback.bind(null, island), 0);
    }
    else {
        async.auto({
            ress: loadHqrAsync('RESS.HQR'),
            ile: loadHqrAsync(`${island.name}.ILE`),
            obl: loadHqrAsync(`${island.name}.OBL`)
        }, function(err, files) {
            callback(loadIslandSync(island, files));
        });
    }

}

function loadIslandSync(island, files) {
    const layout = loadLayout(files.ile);
    island.data = {
        files: files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        layout: layout
    };

    const scene = new THREE.Scene();

    const geometries = loadGeometries(island);
    _.each(geometries, ({positions, uvs, colors, uvGroups, material}, name) => {
        if (positions && positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            if (uvs) {
                bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, uvGroups ? false : true));
            }
            if (colors) {
                bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 4, true));
            }
            if (uvGroups) {
                bufferGeometry.addAttribute('uvGroup', new THREE.BufferAttribute(new Uint8Array(uvGroups), 4));
            }
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.name = name;
            scene.add(mesh);
        }
    });

    scene.add(loadSky(geometries));

    island.data.threeScene = scene;
    island.data.physics = loadIslandPhysics(layout);

    const seaTimeUniform = scene.getObjectByName('sea').material.uniforms.time;
    island.data.update = time => { seaTimeUniform.value = time.elapsed; };

    return island;
}

function loadSky(geometries) {
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(128, 128, 1, 1), geometries.sky.material);
    sky.rotateX(Math.PI / 2.0);
    sky.position.y = 2.0;
    return sky;
}

function loadGeometries(island) {
    const geometries = prepareGeometries(island);
    const usedTiles = {};
    const objects = [];

    _.each(island.data.layout.groundSections, section => {
        const tilesKey = [section.x, section.z].join(',');
        usedTiles[tilesKey] = [];
        loadGround(island.data, section, geometries, usedTiles[tilesKey]);
        loadObjects(island.data, section, geometries, objects);
    });

    _.each(island.data.layout.seaSections, section => {
        const xd = Math.floor(section.x / 2);
        const zd = Math.floor(section.z / 2);
        const offsetX = 1 - Math.abs(section.x % 2);
        const offsetZ = Math.abs(section.z % 2);
        const tilesKey = [xd, zd].join(',');
        loadSea(section, geometries, usedTiles[tilesKey], offsetX, offsetZ, island.envInfo.index);
    });

    return geometries;
}
