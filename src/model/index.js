import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {loadTexture} from '../texture';
import {loadEntity} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import {loadBodyGeometry} from './geometry';

import vertexShader from './shaders/model.vert.glsl';
import fragmentShader from './shaders/model.frag.glsl';

export default function(models, index, entityIdx, bodyIdx, animIdx, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModel(files, models, index, entityIdx, bodyIdx, animIdx));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModel(files, model, index, entityIdx, bodyIdx, animIdx) {
    if (!model) {
        model = {
            files: files,
            palette: new Uint8Array(files.ress.getEntry(0)),
            entity: files.ress.getEntry(44),
            bodies: [],
            anims: [],
            object3D: []
        };
    }
 
    if (!model.entities) {
        model.entities = loadEntity(model.entity);
    }
    const entity = model.entities[entityIdx];
    //const realBodyIdx = entity.bodies[bodyIdx].index;
    //const realAnimIdx = entity.anims[animIdx].index;

    const body = loadBody(model, model.bodies, bodyIdx);
    const anim = loadAnim(model, model.anims, animIdx);

    if (!model.object3D[index]) {
        const mesh = loadMesh(model, body, bodyIdx);
        const obj = {
            mesh: mesh,
            skeleton: createSkeleton(body),
            currentFrame: 0,
            startFrame:0,
            lastFrame:0,
            currentTime:0,
            elapsedTime:0
        }
        model.object3D[index] = obj;
    } 
    return model;
}

function loadMesh(model, body, index) {
    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            body: {value: loadTexture(model.files.ress.getEntry(6), model.palette)}
        }
    });

    const {positions, uvs, colors, linePositions, lineColors} = loadGeometry(model, body);
    const object = new THREE.Object3D();

    if (positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 4, true));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(lineColors), 4, true));

        const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
        object.add(lineSegments);
    }

    return object;
}

function loadGeometry(model, body) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: [],
        linePositions: [],
        lineColors: []
    };
    
    loadBodyGeometry(geometry, body, model.palette);

    return geometry;
}

function createSkeleton(body) {
    
}
