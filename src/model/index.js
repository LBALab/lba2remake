import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {loadTexture} from '../texture';
import {loadBody2} from './body2';

// TODO create model own shaders
import vertexShader from './shaders/model.vert.glsl';
import fragmentShader from './shaders/model.frag.glsl';

export default function(callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModel(files));
    });
}

function loadModel(files) {
    const model = {
        files: files,
        palette: new Uint8Array(files.ress.getEntry(0)),
        entity: new Uint8Array(files.ress.getEntry(44))
    };

    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            body: {value: loadTexture(model.files.ress.getEntry(6), model.palette)}
        }
    });

    const {positions, uvs, colors, linePositions, lineColors} = loadGeometry(model);

    // TODO double check we will required the same geometry
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, true));
    bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 4, true));

    const linebufferGeometry = new THREE.BufferGeometry();
    linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(lineColors), 4, true));

    const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
    const modelMesh = new THREE.Mesh(bufferGeometry, material);
    modelMesh.add(lineSegments);

    return modelMesh;
}

function loadGeometry(model) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: [],
        linePositions: [],
        lineColors: []
    };
    const objects = [];

    // TODO for each entity entry
    loadBody2(model, geometry, objects, 7);

    // _.each(model.layout, section => {
    //     loadGround(island, section, geometry);
    //     loadObjects(island, section, geometry, objects);
    // });
    return geometry;
}
