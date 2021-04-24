import * as THREE from 'three';
import {each} from 'lodash';

import VERT_COLORED from './shaders/colored.vert.glsl';
import FRAG_COLORED from './shaders/colored.frag.glsl';
import VERT_TEXTURED from './shaders/textured.vert.glsl';
import FRAG_TEXTURED from './shaders/textured.frag.glsl';

import {loadPaletteTexture, loadSubTextureRGBA} from '../texture';
import {compile} from '../utils/shaders';
import { WORLD_SIZE, PolygonType } from '../utils/lba';
import Lightning from '../game/scenery/island/environment/Lightning';
import { getParams } from '../params';

const push = Array.prototype.push;

const fakeNoiseBuffer = new Uint8Array(1);
fakeNoiseBuffer[0] = 128;
const fakeNoise = new THREE.DataTexture(
    fakeNoiseBuffer,
    1,
    1,
    THREE.AlphaFormat,
    THREE.UnsignedByteType
);

interface ModelGeometry {
    positions: number[];
    uvs?: number[];
    uvGroups?: number[];
    colors: number[];
    normals: number[];
    bones: number[];
    polyTypes: number[];
    linePositions: number[];
    lineNormals: number[];
    lineColors: number[];
    lineBones: number[];
    material: THREE.Material;
}

const worldScale = 1 / (WORLD_SIZE * 0.04);

function prepareGeometries(texture, bones, matrixRotation, palette, lutTexture, envInfo, ambience) {
    const paletteTexture = loadPaletteTexture(palette);
    const light = getLightVector(ambience);
    return {
        colored: {
            positions: [],
            normals: [],
            colors: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', VERT_COLORED),
                fragmentShader: compile('frag', FRAG_COLORED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    palette: {value: paletteTexture},
                    noise: {value: fakeNoise},
                    light: {value: light},
                    bonePos: { value: bones.position },
                    boneRot: { value: bones.rotation },
                    rotationMatrix: { value: matrixRotation }
                }
            })
        },
        textured: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            colors: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', VERT_TEXTURED),
                fragmentShader: compile('frag', FRAG_TEXTURED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    uTexture: {value: texture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
                    light: {value: light},
                    bonePos: { value: bones.position },
                    boneRot: { value: bones.rotation },
                    rotationMatrix: { value: matrixRotation }
                }
            })
        },
        textured_transparent: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            colors: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineBones: [],
            material: new THREE.RawShaderMaterial({
                transparent: true,
                vertexShader: compile('vert', VERT_TEXTURED),
                fragmentShader: compile('frag', FRAG_TEXTURED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    uTexture: {value: texture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
                    light: {value: light},
                    bonePos: { value: bones.position },
                    boneRot: { value: bones.rotation },
                    rotationMatrix: { value: matrixRotation }
                }
            })
        }
    };
}

export function loadMesh(
    body,
    texture,
    bones,
    matrixRotation,
    palette,
    lutTexture,
    envInfo,
    ambience
) {
    const materials = [];
    const geometries = loadGeometry(
        body,
        texture,
        bones,
        matrixRotation,
        palette,
        lutTexture,
        envInfo,
        ambience
    );
    const object = new THREE.Object3D();
    const isLBA1 = getParams().game === 'lba1';

    each(geometries, (geom: ModelGeometry, name) => {
        const {
            positions,
            uvs,
            uvGroups,
            colors,
            normals,
            polyTypes,
            bones: boneIndices,
            linePositions,
            lineNormals,
            lineColors,
            lineBones,
            material
        } = geom;
        if (positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(positions), 3)
            );
            bufferGeometry.setAttribute(
                'normal',
                new THREE.BufferAttribute(new Float32Array(normals), 3)
            );
            if (uvs) {
                bufferGeometry.setAttribute(
                    'uv',
                    new THREE.BufferAttribute(new Uint8Array(uvs), 2, false)
                );
            }
            if (uvGroups) {
                bufferGeometry.setAttribute(
                    'uvGroup',
                    new THREE.BufferAttribute(new Uint8Array(uvGroups), 4, false)
                );
            }
            bufferGeometry.setAttribute(
                'color',
                new THREE.BufferAttribute(new Float32Array(colors), 1)
            );
            bufferGeometry.setAttribute(
                'boneIndex',
                new THREE.BufferAttribute(new Uint8Array(boneIndices), 1)
            );
            bufferGeometry.setAttribute(
                'polyType',
                new THREE.BufferAttribute(new Uint8Array(polyTypes), 1, false)
            );

            if (body.boundingBox) {
                bufferGeometry.boundingBox = body.boundingBox;
                const sphere = new THREE.Sphere();
                bufferGeometry.boundingSphere = body.boundingBox.getBoundingSphere(sphere);
            }
            if (isLBA1) {
                bufferGeometry.computeVertexNormals();
            }

            const modelMesh = new THREE.Mesh(bufferGeometry, material);
            modelMesh.onBeforeRender = Lightning.applyUniforms;
            modelMesh.name = name;
            modelMesh.matrixAutoUpdate = false;
            object.add(modelMesh);
            materials.push(material);
        }

        if (linePositions.length > 0) {
            const linebufferGeometry = new THREE.BufferGeometry();
            linebufferGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(linePositions), 3)
            );
            linebufferGeometry.setAttribute(
                'normal',
                new THREE.BufferAttribute(new Float32Array(lineNormals), 3)
            );
            linebufferGeometry.setAttribute(
                'color',
                new THREE.BufferAttribute(new Uint8Array(lineColors), 1, false)
            );
            linebufferGeometry.setAttribute(
                'boneIndex',
                new THREE.BufferAttribute(new Uint8Array(lineBones), 1)
            );

            const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
            lineSegments.onBeforeRender = Lightning.applyUniforms;
            lineSegments.name = 'lines';
            lineSegments.matrixAutoUpdate = false;
            object.add(lineSegments);
            materials.push(material);
        }
    });
    return {object, materials};
}

function loadGeometry(
    body,
    texture,
    bones,
    matrixRotation,
    palette,
    lutTexture,
    envInfo,
    ambience
) {
    const geometries = prepareGeometries(
        texture,
        bones,
        matrixRotation,
        palette,
        lutTexture,
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
    each(body.polygons, (p) => {
        const uvGroup = getUVGroup(body, p);
        const baseGroup = p.hasTransparency ? 'textured_transparent' : 'textured';
        const group = uvGroup ? `${baseGroup}_${uvGroup.join(',')}` : baseGroup;
        const faceNormal = getFaceNormal(body, p);
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
            if (p.hasTransparency || p.hasTex) {
                createSubgroupGeometry(geometries, group, baseGroup, uvGroup);
                push.apply(geometries[group].positions, getPosition(body, vertexIndex));
                push.apply(geometries[group].normals, faceNormal || getNormal(body, vertexIndex));
                push.apply(geometries[group].uvs, getUVs(body, p, j));
                push.apply(geometries[group].uvGroups, getUVGroup(body, p));
                push.apply(geometries[group].bones, getBone(body, vertexIndex));
                geometries[group].polyTypes.push(p.polyType);
                geometries[group].colors.push(p.colour);
            } else {
                push.apply(geometries.colored.positions, getPosition(body, vertexIndex));
                push.apply(geometries.colored.normals, faceNormal || getNormal(body, vertexIndex));
                push.apply(geometries.colored.bones, getBone(body, vertexIndex));
                geometries.colored.polyTypes.push(p.polyType);
                geometries.colored.colors.push(p.colour);
            }
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (p.numVertex >= 4) { // quad
            each([0, 2, 3], (j) => {
                addVertex(j);
            });
        }
    });
}

function loadSphereGeometry(geometries, body) {
    each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        const normal = getNormal(body, s.vertex);

        const addVertex = (x, y, z) => {
            push.apply(geometries.colored.positions, [
                x + centerPos[0],
                y + centerPos[1],
                z + centerPos[2]
            ]);
            push.apply(geometries.colored.normals, normal);
            push.apply(geometries.colored.bones, getBone(body, s.vertex));
            geometries.colored.colors.push(s.colour);
            geometries.colored.polyTypes.push(0);
        };

        const { array: vertex } = sphereGeometry.attributes.position;
        const { array: index, count } = sphereGeometry.index;
        for (let i = 0; i < count; i += 1) {
            const idx = index[i] * 3;
            addVertex(vertex[idx], vertex[idx + 1], vertex[idx + 2]);
        }
    });
}

function loadLineGeometry(geometries, body) {
    each(body.lines, (l) => {
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

/*
function debugBoneGeometry(geometries, body) {
    each(body.bones, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const normal = getNormal(body, s.vertex);

        const addVertex = (j) => {
            push.apply(geometries.colored.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
            push.apply(geometries.colored.normals, normal);
            push.apply(geometries.colored.bones, getBone(body, s.vertex));
            geometries.colored.colors.push((s.parent === 0xFFFF) ? 0 : 255);
        };

        each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
    });
}
*/

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

const U = new THREE.Vector3();
const V = new THREE.Vector3();
const P1 = new THREE.Vector3();

// Face normal algorithm from:
// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
function getFaceNormal(body, poly) {
    if (poly.polyType === PolygonType.FLAT) {
        P1.fromArray(getPosition(body, poly.vertex[0]));
        U.fromArray(getPosition(body, poly.vertex[1])).sub(P1);
        V.fromArray(getPosition(body, poly.vertex[2])).sub(P1);
        return [
            (U.y * V.z) - (U.z * V.y),
            (U.z * V.x) - (U.x * V.z),
            (U.x * V.y) - (U.y * V.x),
        ];
    }
    return null;
}

function getNormal(body, index) {
    const normal = body.normals[index];
    if (!normal) {
        return [0, 0, 0];
    }
    return [
        normal.x,
        normal.y,
        normal.z/* ,
        normal.colour */
    ];
}

function getUVs(_body, p, vertex) {
    if (p.hasTex) {
        return [
            p.u[vertex],
            p.v[vertex]
        ];
    }
    return [0, 0];
}

function getUVGroup(body, p) {
    if (p.hasTex) {
        return body.uvGroups[p.tex];
    }
    return [0, 0, 255, 255];
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    return lightVector;
}

function createSubgroupGeometry(geometries, group, baseGroup, uvGroup) {
    if (group in geometries) {
        return;
    }
    const baseMaterial = geometries[baseGroup].material;
    const baseUniforms = baseMaterial.uniforms;
    const transparent = baseGroup === 'textured_transparent';
    const baseTexture = baseUniforms.uTexture.value;
    let groupTexture = baseTexture;
    if (uvGroup.join(',') !== '0,0,255,255') {
        groupTexture = loadSubTextureRGBA(
            baseTexture.image.data,
            uvGroup[0],
            uvGroup[1],
            uvGroup[2] + 1,
            uvGroup[3] + 1
        );
    }
    geometries[group] = {
        positions: [],
        normals: [],
        uvs: [],
        uvGroups: [],
        colors: [],
        bones: [],
        polyTypes: [],
        linePositions: [],
        lineNormals: [],
        lineColors: [],
        lineBones: [],
        material: new THREE.RawShaderMaterial({
            transparent,
            vertexShader: baseMaterial.vertexShader,
            fragmentShader: baseMaterial.fragmentShader,
            uniforms: {
                fogColor: baseUniforms.fogColor,
                fogDensity: baseUniforms.fogDensity,
                worldScale: {value: worldScale},
                uTexture: {value: groupTexture},
                lutTexture: baseUniforms.lutTexture,
                palette: baseUniforms.palette,
                light: baseUniforms.light,
                bonePos: baseUniforms.bonePos,
                boneRot: baseUniforms.boneRot,
                rotationMatrix: baseUniforms.rotationMatrix,
            }
        })
    };
}
