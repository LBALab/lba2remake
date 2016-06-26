import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {loadTexture} from '../texture';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadObjects} from './objects';

import vertexShader from './shaders/ground.vert.glsl';
import fragmentShader from './shaders/ground.frag.glsl';

export default function(name, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        ile: loadHqrAsync(`${name}.ILE`),
        obl: loadHqrAsync(`${name}.OBL`)
    }, function(err, files) {
        callback(loadIsland(files));
    });
}

function loadIsland(files) {
    const island = {
        files: files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        layout: loadLayout(files.ile)
    };

    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            ground: {value: loadTexture(island.files.ile.getEntry(1), island.palette)},
            objects: {value: loadTexture(island.files.ile.getEntry(2), island.palette)}
        }
    });
    const bufferGeometry = new THREE.BufferGeometry();
    const {positions, uvs, colors} = loadGeometry(island);
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, true));
    bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 4, true));

    return new THREE.Mesh(bufferGeometry, material);
}

function loadGeometry(island) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: []
    };
    const objects = [];
    _.each(island.layout, section => {
        loadGround(island, section, geometry);
        loadObjects(island, section, geometry, objects);
    });
    return geometry;
}