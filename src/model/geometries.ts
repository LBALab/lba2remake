import * as THREE from 'three';
import {each} from 'lodash';

import { loadSubTextureRGBA } from '../texture';
import { PolygonType } from '../utils/lba';
import Lightning from '../game/scenery/island/environment/Lightning';
import LBAStandardMaterial from '../graphics/materials/LBAStandardMaterial';

const push = Array.prototype.push;

interface ModelGeometry {
    positions: number[];
    uvs?: number[];
    uvGroups?: number[];
    colors: number[];
    intensities: number[];
    normals: number[];
    bones: number[];
    polyTypes: number[];
    linePositions: number[];
    lineNormals: number[];
    lineColors: number[];
    lineIntensities: number[];
    lineBones: number[];
    material: THREE.Material;
}

function prepareGeometries(
    texture,
    bones,
    _matrixRotation,
    _palette,
    _lutTexture,
    _envInfo,
    _ambience
) {
    return {
        colored: {
            positions: [],
            normals: [],
            colors: [],
            intensities: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineIntensities: [],
            lineBones: [],
            material: new LBAStandardMaterial({
                bones,
                vertexColors: true,
            })
        },
        colored_transparent: {
            positions: [],
            normals: [],
            colors: [],
            intensities: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineIntensities: [],
            lineBones: [],
            material: new LBAStandardMaterial({
                bones,
                vertexColors: true,
                transparent: true,
                opacity: 0.5,
            })
        },
        textured: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            colors: [],
            intensities: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineIntensities: [],
            lineBones: [],
            material: new LBAStandardMaterial({
                bones,
                map: texture,
            })
        },
        textured_transparent: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            colors: [],
            intensities: [],
            bones: [],
            polyTypes: [],
            linePositions: [],
            lineNormals: [],
            lineColors: [],
            lineIntensities: [],
            lineBones: [],
            material: new LBAStandardMaterial({
                bones,
                map: texture,
                transparent: true,
                opacity: 0.5,
            })
        }
    };
}

export function loadMesh(
    body,
    texture,
    bones,
    palette,
    lutTexture,
    envInfo,
    ambience
) {
    const matrixRotation = new THREE.Matrix4();
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

    each(geometries, (geom: ModelGeometry, name) => {
        const {
            positions,
            uvs,
            uvGroups,
            colors,
            intensities,
            normals,
            polyTypes,
            bones: boneIndices,
            linePositions,
            lineNormals,
            lineColors,
            lineIntensities,
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
                    'uvgroup',
                    new THREE.BufferAttribute(new Uint16Array(uvGroups), 4, false)
                );
            }
            bufferGeometry.setAttribute(
                'color',
                new THREE.BufferAttribute(new Uint8Array(colors), 3, true)
            );
            bufferGeometry.setAttribute(
                'intensity',
                new THREE.BufferAttribute(new Uint8Array(intensities), 1, false)
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
                new THREE.BufferAttribute(new Uint8Array(lineColors), 3, true)
            );
            linebufferGeometry.setAttribute(
                'intensity',
                new THREE.BufferAttribute(new Uint8Array(lineIntensities), 1, false)
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
    return {object, materials, matrixRotation};
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

    loadFaceGeometry(geometries, body, palette);
    loadSphereGeometry(geometries, body, palette);
    loadLineGeometry(geometries, body, palette);
    // debugBoneGeometry(geometries, body);

    return geometries;
}

function loadFaceGeometry(geometries, body, palette) {
    each(body.polygons, (p) => {
        const uvGroup = getUVGroup(body, p);
        const baseGroup = p.hasTransparency ? 'textured_transparent' : 'textured';
        const group = uvGroup ? `${baseGroup}_${uvGroup.join(',')}` : baseGroup;
        const faceNormal = getFaceNormal(body, p);
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
            if ((p.hasTransparency && p.polyType !== PolygonType.TRANS) || p.hasTex) {
                createSubgroupGeometry(geometries, group, baseGroup, uvGroup);
                push.apply(geometries[group].positions, getPosition(body, vertexIndex));
                push.apply(geometries[group].normals, faceNormal || getNormal(body, vertexIndex));
                push.apply(geometries[group].uvs, getUVs(body, p, j));
                push.apply(geometries[group].uvGroups, getUVGroup(body, p));
                push.apply(geometries[group].bones, getBone(body, vertexIndex));
                push.apply(geometries[group].colors, getColor(p.colour, p.intensity, palette));
                geometries[group].polyTypes.push(p.polyType);
                geometries[group].intensities.push(p.intensity);
            } else {
                const cGroup = p.polyType === PolygonType.TRANS ? 'colored_transparent' : 'colored';
                push.apply(geometries[cGroup].positions, getPosition(body, vertexIndex));
                push.apply(geometries[cGroup].normals, faceNormal || getNormal(body, vertexIndex));
                push.apply(geometries[cGroup].bones, getBone(body, vertexIndex));
                push.apply(geometries[cGroup].colors, getColor(p.colour, p.intensity, palette));
                geometries[cGroup].polyTypes.push(p.polyType);
                geometries[cGroup].intensities.push(p.intensity);
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

function loadSphereGeometry(geometries, body, palette) {
    each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);

        const addVertex = (idx) => {
            const x = vertex[idx];
            const y = vertex[idx + 1];
            const z = vertex[idx + 2];
            const normal = [
                normals[idx],
                normals[idx + 1],
                normals[idx + 2],
            ];
            push.apply(geometries.colored.positions, [
                x + centerPos[0],
                y + centerPos[1],
                z + centerPos[2]
            ]);
            push.apply(geometries.colored.normals, normal);
            push.apply(geometries.colored.bones, getBone(body, s.vertex));
            push.apply(geometries.colored.colors, getColor(s.colour, s.intensity, palette));
            geometries.colored.intensities.push(s.intensity);
            geometries.colored.polyTypes.push(0);
        };

        const { array: vertex } = sphereGeometry.attributes.position;
        const { array: normals } = sphereGeometry.attributes.normal;
        const { array: index, count } = sphereGeometry.index;
        for (let i = 0; i < count; i += 1) {
            const idx = index[i] * 3;
            addVertex(idx);
        }
    });
}

function loadLineGeometry(geometries, body, palette) {
    each(body.lines, (l) => {
        const addVertex = (color, intensity, i) => {
            push.apply(geometries.colored.linePositions, getPosition(body, i));
            push.apply(geometries.colored.lineNormals, getNormal(body, i));
            push.apply(geometries.colored.lineBones, getBone(body, i));
            push.apply(geometries.colored.lineColors, getColor(color, intensity, palette));
            geometries.colored.lineIntensities.push(intensity);
        };

        addVertex(l.colour, l.intensity, l.vertex1);
        addVertex(l.colour, l.intensity, l.vertex2);
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

function getColor(color, intensity, palette) {
    const idx = color * 16 + intensity;
    return [
        palette[idx * 3],
        palette[idx * 3 + 1],
        palette[idx * 3 + 2],
    ];
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

function createSubgroupGeometry(geometries, group, baseGroup, uvGroup) {
    if (group in geometries) {
        return;
    }
    const baseMaterial = geometries[baseGroup].material;
    const transparent = baseGroup === 'textured_transparent';
    const baseTexture = baseMaterial.map;
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
        intensities: [],
        bones: [],
        polyTypes: [],
        linePositions: [],
        lineNormals: [],
        lineColors: [],
        lineIntensities: [],
        lineBones: [],
        material: new LBAStandardMaterial({
            bones: baseMaterial.bones,
            map: groupTexture,
            useTextureAtlas: true,
            transparent
        }),
    };
}
