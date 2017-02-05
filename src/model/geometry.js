import THREE from 'three';
import _ from 'lodash';

import vertexShader from './shaders/model.vert.glsl';
import fragmentShader from './shaders/model.frag.glsl';

import {loadPaletteTexture} from '../texture';

const push = Array.prototype.push;

export function loadMesh(body, texture, matrixBones, palette, envInfo, ambience) {
    const light = getLightVector(ambience);
    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
            fogDensity: {value: envInfo.fogDensity},
            texture: { value: texture },
            palette: { value: loadPaletteTexture(palette) },
            light: {value: light},
            bones: { value: matrixBones, type:'m4v' }
        }
    });

    const geometry = loadGeometry(body, palette);
    const object = new THREE.Object3D();

    if (geometry.positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.positions), 3));
        bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 4));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(geometry.uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.colors), 4, true));
        bufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(geometry.bones), 1));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (geometry.linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.linePositions), 3));
        linebufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.lineNormals), 4));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.lineColors), 4, true));
        linebufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(geometry.lineBones), 1));

        const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
        object.add(lineSegments);
    }

    return object;
}

function loadGeometry(body, palette) {
    const geometry = {
        positions: [],
        normals: [],
        uvs: [],
        colors: [],
        bones: [],
        linePositions: [],
        lineNormals: [],
        lineColors: [],
        lineBones: []
    };
    
    loadBodyGeometry(geometry, body, palette);

    return geometry;
}

function loadBodyGeometry(geometry, body, palette) {
    loadFaceGeometry(geometry, body, palette);
    loadSphereGeometry(geometry, body, palette);
    loadLineGeometry(geometry, body, palette);
    //debugBoneGeometry(geometry, body);
}

function loadFaceGeometry(geometry, body, palette) {
    _.each(body.polygons, (p) => {
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
    	    push.apply(geometry.positions, getPosition(body, vertexIndex));
    	    push.apply(geometry.normals, getNormal(body, vertexIndex));
            push.apply(geometry.colors, getColour(p.colour, palette, p.hasTransparency, p.hasTex));
            push.apply(geometry.uvs, getUVs(body, p, j));
            push.apply(geometry.bones, getBone(body, vertexIndex));
        };    
        for (let j = 0; j < 3; ++j) {
            addVertex(j);
        } 
        if (p.numVertex == 4) { // quad
            for (let j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    });
}

function loadSphereGeometry(geometry, body, palette) {
    _.each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        const normal = getNormal(body, s.vertex);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
    	    push.apply(geometry.normals, normal);
            push.apply(geometry.colors, getColour(s.colour, palette, false, false));
            push.apply(geometry.uvs, [0,0]);
            push.apply(geometry.bones, getBone(body, s.vertex));
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function loadLineGeometry(geometry, body, palette) {
    _.each(body.lines, (l) => {
        const addVertex = (c,i) => {
            push.apply(geometry.linePositions, getPosition(body, i));
            push.apply(geometry.lineNormals, getNormal(body, i));
            push.apply(geometry.lineColors, getColour(c, palette, false, false));
            push.apply(geometry.lineBones, getBone(body, i));
        };

        addVertex(l.colour, l.vertex1);
        addVertex(l.colour, l.vertex2);
    });
}

function debugBoneGeometry(geometry, body) {
    _.each(body.bones, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(0.001, 8, 8);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometry.colors, (s.parent == 0xFFFF) ? [0,0,255,255] : [255,0,0,255]);
            push.apply(geometry.uvs, [0,0]);
            push.apply(geometry.bones, getBone(object, s.vertex));
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function getBone(body, index) {
    const vertex = body.vertices[index];
    return [ vertex.bone ];
}

function getPosition(body, index) {
    const vertex = body.vertices[index];
    return [
        vertex.x,
        vertex.y,
        vertex.z
    ];
}

function getColour(colour, palette, hasTransparency, hasTex) {
    return [
        palette[colour * 3], 
        palette[colour * 3 + 1],
        palette[colour * 3 + 2],
        hasTex ? 0 : hasTransparency ? 127 : 255 
    ];
}

function getNormal(body, index) {
    const normal = body.normals[index];
    return [
        normal.x,
        normal.y,
        normal.z,
        normal.colour
    ];
}

function getUVs(body, p, vertex) {
    if (p.hasTex) {
        const t = body.uvGroups[p.tex];
        const x = p.texX[vertex] + p.unkX[vertex]/256;
        const y = p.texY[vertex] + p.unkY[vertex]/256;
        return [(x & t.width) + t.x, (y & t.height) + t.y];
    }
    return [0, 0];
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), -ambience.lightingAlpha * 2 * Math.PI / 0x1000);
    lightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), -ambience.lightingBeta * 2 * Math.PI / 0x1000);
    return lightVector;
}
