import * as THREE from 'three';
import _ from 'lodash';

import VERT_COLORED from './shaders/colored.vert.glsl';
import FRAG_COLORED from './shaders/colored.frag.glsl';
import VERT_TEXTURED from './shaders/textured.vert.glsl';
import FRAG_TEXTURED from './shaders/textured.frag.glsl';

import {loadPaletteTexture} from '../texture';

const push = Array.prototype.push;

function prepareGeometries(texture, bones, matrixRotation, palette, envInfo, ambience) {
    const paletteTexture = loadPaletteTexture(palette);
    const light = getLightVector(ambience);
    return {
        colored: {
            positions: [],
            normals: [],
            colors: [],
            bones: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_COLORED,
                fragmentShader: FRAG_COLORED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    light: {value: light},
                    bonePos: { value: bones.position, type: 'v3v' },
                    boneRot: { value: bones.rotation, type: 'v4v' },
                    rotationMatrix: { value: matrixRotation, type: 'm4v' }
                }
            })
        },
        textured: {
            positions: [],
            normals: [],
            uvs: [],
            colors: [],
            bones: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_TEXTURED,
                fragmentShader: FRAG_TEXTURED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: texture},
                    palette: {value: paletteTexture},
                    light: {value: light},
                    bonePos: { value: bones.position, type: 'v3v' },
                    boneRot: { value: bones.rotation, type: 'v4v' },
                    rotationMatrix: { value: matrixRotation, type: 'm4v' }
                }
            })
        },
        textured_transparent: {
            positions: [],
            normals: [],
            uvs: [],
            colors: [],
            bones: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                transparent: true,
                vertexShader: VERT_TEXTURED,
                fragmentShader: FRAG_TEXTURED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: texture},
                    palette: {value: paletteTexture},
                    light: {value: light},
                    bonePos: { value: bones.position, type: 'v3v' },
                    boneRot: { value: bones.rotation, type: 'v4v' },
                    rotationMatrix: { value: matrixRotation, type: 'm4v' }
                }
            })
        }
    };
}

export function loadMesh(body, texture, bones, matrixRotation, palette, envInfo, ambience) {
    const geometries = loadGeometry(
        body,
        texture,
        bones,
        matrixRotation,
        palette,
        envInfo,
        ambience
    );
    const object = new THREE.Object3D();

    _.each(geometries, (geom, name) => {
        const {
            positions,
            uvs,
            colors,
            normals,
            bones: boneIndices,
            linePositions,
            lineNormals,
            lineColors,
            lineBones,
            material
        } = geom;
        if (positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
            if (uvs) {
                bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, true));
            }
            bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 1, false));
            bufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(boneIndices), 1));

            const modelMesh = new THREE.Mesh(bufferGeometry, material);
            modelMesh.frustumCulled = false;
            modelMesh.name = name;
            object.add(modelMesh);
        }

        if (linePositions.length > 0) {
            const linebufferGeometry = new THREE.BufferGeometry();
            linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
            linebufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(lineNormals), 3));
            linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(lineColors), 1, false));
            linebufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(lineBones), 1));

            const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
            lineSegments.name = 'lines';
            object.add(lineSegments);
        }
    });
    return object;
}

function loadGeometry(body, texture, bones, matrixRotation, palette, envInfo, ambience) {
    const geometries = prepareGeometries(
        texture,
        bones,
        matrixRotation,
        palette,
        envInfo,
        ambience
    );

    loadFaceGeometry(geometries, body);
    loadSphereGeometry(geometries, body);
    loadLineGeometry(geometries, body);
    // debugBoneGeometry(geometries, body);

    return geometries;
}

function loadFaceGeometry(geometries, body) {
    _.each(body.polygons, (p) => {
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
            if (p.hasTransparency) {
                push.apply(
                    geometries.textured_transparent.positions,
                    getPosition(body, vertexIndex)
                );
                push.apply(geometries.textured_transparent.normals, getNormal(body, vertexIndex));
                push.apply(geometries.textured_transparent.uvs, getUVs(body, p, j));
                push.apply(geometries.textured_transparent.bones, getBone(body, vertexIndex));
                geometries.textured_transparent.colors.push(p.colour);
            } else if (p.hasTex) {
                push.apply(geometries.textured.positions, getPosition(body, vertexIndex));
                push.apply(geometries.textured.normals, getNormal(body, vertexIndex));
                push.apply(geometries.textured.uvs, getUVs(body, p, j));
                push.apply(geometries.textured.bones, getBone(body, vertexIndex));
                geometries.textured.colors.push(p.colour);
            } else {
                push.apply(geometries.colored.positions, getPosition(body, vertexIndex));
                push.apply(geometries.colored.normals, getNormal(body, vertexIndex));
                push.apply(geometries.colored.bones, getBone(body, vertexIndex));
                geometries.colored.colors.push(p.colour);
            }
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (p.numVertex === 4) { // quad
            for (const j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    });
}

function loadSphereGeometry(geometries, body) {
    _.each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        const normal = getNormal(body, s.vertex);

        const addVertex = (j) => {
            push.apply(geometries.colored.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometries.colored.normals, normal);
            push.apply(geometries.colored.bones, getBone(body, s.vertex));
            geometries.colored.colors.push(s.colour);
        };

        _.each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}

function loadLineGeometry(geometries, body) {
    _.each(body.lines, (l) => {
        const addVertex = (c, i) => {
            push.apply(geometries.colored.linePositions, getPosition(body, i));
            push.apply(geometries.colored.lineNormals, getNormal(body, i));
            push.apply(geometries.colored.lineBones, getBone(body, i));
            geometries.colored.lineColors.push(c);
        };

        addVertex(l.colour, l.vertex1);
        addVertex(l.colour, l.vertex2);
    });
}

// eslint-disable-next-line no-unused-vars
function debugBoneGeometry(geometries, body) {
    _.each(body.bones, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(0.001, 8, 8);

        const addVertex = (j) => {
            push.apply(geometries.colored.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometries.colored.bones, getBone(object, s.vertex));
            geometries.colored.colors.push((s.parent === 0xFFFF) ? 0 : 255);
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
    return [vertex.bone];
}

function getPosition(body, index) {
    const vertex = body.vertices[index];
    return [
        vertex.x,
        vertex.y,
        vertex.z
    ];
}

function getNormal(body, index) {
    const normal = body.normals[index];
    return [
        normal.x,
        normal.y,
        normal.z/* ,
        normal.colour */
    ];
}

function getUVs(body, p, vertex) {
    if (p.hasTex) {
        const t = body.uvGroups[p.tex];
        const x = p.texX[vertex] + p.unkX[vertex] / 256;
        const y = p.texY[vertex] + p.unkY[vertex] / 256;
        return [(x & t.width) + t.x, (y & t.height) + t.y];
    }
    return [0, 0];
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -ambience.lightingAlpha * 2 * Math.PI / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -ambience.lightingBeta * 2 * Math.PI / 0x1000
    );
    return lightVector;
}
