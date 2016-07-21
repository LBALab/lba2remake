import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {loadTexture} from '../texture';
import {loadLayout} from './layout';
import {loadGround} from './ground';
import {loadObjects} from './objects';

import shaders from './shaders';

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

    const object = new THREE.Object3D();

    const geometries = loadGeometries(island);
    _.each(geometries, ({positions, uvs, colors, uvGroups, material}) => {
        if (positions.length > 0) {
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

    return object;
}

function loadGeometries(island) {
    const geometries = {
        colored: {
            positions: [],
            colors: []
        },
        textured: {
            positions: [],
            colors: [],
            uvs: []
        },
        atlas_textured: {
            positions: [],
            colors: [],
            uvs: [],
            uvGroups: []
        }
    };

    loadMaterials(island, geometries);

    const objects = [];
    _.each(island.layout, section => {
        loadGround(island, section, geometries);
        loadObjects(island, section, geometries, objects);
    });
    return geometries;
}

function loadMaterials(island, geometries) {
    geometries.colored.material = new THREE.RawShaderMaterial({
        vertexShader: shaders.colored.vert,
        fragmentShader: shaders.colored.frag
    });

    geometries.textured.material = new THREE.RawShaderMaterial({
        vertexShader: shaders.textured.vert,
        fragmentShader: shaders.textured.frag,
        uniforms: {
            texture: {value: loadTexture(island.files.ile.getEntry(1), island.palette)}
        }
    });

    geometries.atlas_textured.material = new THREE.RawShaderMaterial({
        vertexShader: shaders.atlas_textured.vert,
        fragmentShader: shaders.atlas_textured.frag,
        uniforms: {
            texture: {value: loadTexture(island.files.ile.getEntry(2), island.palette)}
        }
    });
}
