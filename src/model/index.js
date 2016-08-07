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
        const obj = {
            verticies: null, // FIXME make sure we actually need to safe this
            mesh: null,
            skeleton: createSkeleton(body),
            currentFrame: 0,
            startFrame:0,
            lastFrame:0,
            currentTime:0,
            elapsedTime:0
        }

        const geometry = loadGeometry(model, body, obj.skeleton);
        obj.verticies = geometry.positions;

        obj.mesh = loadMesh(model, geometry);
        model.object3D[index] = obj;
    } 
    return model;
}

function loadMesh(model, geometry) {
    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            body: {value: loadTexture(model.files.ress.getEntry(6), model.palette)}
        }
    });

    const object = new THREE.Object3D();

    if (geometry.positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(geometry.uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.colors), 4, true));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (geometry.linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.linePositions), 3));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.lineColors), 4, true));

        const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
        object.add(lineSegments);
    }

    return object;
}

function loadGeometry(model, body, skeleton) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: [],
        linePositions: [],
        lineColors: []
    };
    
    loadBodyGeometry(geometry, body, skeleton, model.palette);

    return geometry;
}

function createSkeleton(body) {
    let skeleton = [];
    for (let i = 0; i < body.bonesSize; ++i) {
        const bone = body.bones[i];
        const boneVertex = body.vertices[bone.vertex];

        skeleton.push({
            boneIndex: i,
            vertexIndex: bone.vertex,
            parent: bone.parent,
            x: boneVertex.x,
            y: boneVertex.y,
            z: boneVertex.z,
        });
    }
    return skeleton;
}
