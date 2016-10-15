import THREE from 'three';
import _ from 'lodash';

import vertexShader from './shaders/model.vert.glsl';
import fragmentShader from './shaders/model.frag.glsl';

const push = Array.prototype.push;

export function loadMesh(model, body, state) {
    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            texture: { value: model.texture },
            bones: { value: state.matrixBones, type:'m4v' }
        }
    });

    const geometry = loadGeometry(model, body, state.skeleton);
    const object = new THREE.Object3D();

    if (geometry.positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(geometry.uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.colors), 4, true));
        bufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(geometry.bones), 1));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (geometry.linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.linePositions), 3));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.lineColors), 4, true));
        linebufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(geometry.lineBones), 1));

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
        bones: [],
        linePositions: [],
        lineColors: [],
        lineBones: []
    };
    
    loadBodyGeometry(geometry, body, skeleton, model.palette);

    return geometry;
}

function loadBodyGeometry(geometry, body, skeleton, palette) {
    loadFaceGeometry(geometry, body, skeleton, palette);
    loadSphereGeometry(geometry, body, skeleton, palette);
    loadLineGeometry(geometry, body, skeleton, palette);
    //debugBoneGeometry(geometry, body, skeleton, palette);
}

function loadFaceGeometry(geometry, body, skeleton, palette) {
    _.each(body.polygons, (p) => {
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
    	    push.apply(geometry.positions, getPosition(body, vertexIndex));
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

function loadSphereGeometry(geometry, body, skeleton, palette) {
    _.each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        
        const addVertex = (j) => {
    	    push.apply(geometry.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
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

function loadLineGeometry(geometry, body, skeleton, palette) {
    _.each(body.lines, (l) => {
        const addVertex = (p,c,i) => {
            push.apply(geometry.linePositions, p);
            push.apply(geometry.lineColors, getColour(c, palette, false, false));
            push.apply(geometry.lineBones, getBone(body, i));
        };
        let v1 = getPosition(body, l.vertex1);
        let v2 = getPosition(body, l.vertex2);

        addVertex(v1,l.colour, l.vertex1);
        addVertex(v2,l.colour, l.vertex2);
    });
}

function debugBoneGeometry(geometry, body, skeleton, palette) {
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

function getUVs(body, p, vertex) {
    if (p.hasTex) {
        const t = body.uvGroups[p.tex];
        const x = p.texX[vertex] + p.unkX[vertex]/256;
        const y = p.texY[vertex] + p.unkY[vertex]/256;
        return [(x & t.width) + t.x, (y & t.height) + t.y];
    }
    return [0, 0];
}
