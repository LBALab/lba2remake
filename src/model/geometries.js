import * as THREE from 'three';
import {each} from 'lodash';

import VERT_COLORED from './shaders/colored.vert.glsl';
import FRAG_COLORED from './shaders/colored.frag.glsl';
import VERT_TEXTURED from './shaders/textured.vert.glsl';
import FRAG_TEXTURED from './shaders/textured.frag.glsl';

import {loadPaletteTexture, loadSubTextureRGBA} from '../texture.ts';
import {compile} from '../utils/shaders';

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

function prepareGeometries(texture, bones, matrixRotation, palette, lutTexture, envInfo, ambience) {
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
                vertexShader: compile('vert', VERT_COLORED),
                fragmentShader: compile('frag', FRAG_COLORED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    noise: {value: fakeNoise},
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
            uvGroups: [],
            colors: [],
            bones: [],
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
                    uTexture: {value: texture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
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
            uvGroups: [],
            colors: [],
            bones: [],
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
                    uTexture: {value: texture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
                    light: {value: light},
                    bonePos: { value: bones.position, type: 'v3v' },
                    boneRot: { value: bones.rotation, type: 'v4v' },
                    rotationMatrix: { value: matrixRotation, type: 'm4v' }
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

    each(geometries, (geom, name) => {
        const {
            positions,
            uvs,
            uvGroups,
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
                bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(uvs), 2, false));
            }
            if (uvGroups) {
                bufferGeometry.addAttribute('uvGroup', new THREE.BufferAttribute(new Uint8Array(uvGroups), 4, false));
            }
            bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 1, false));
            bufferGeometry.addAttribute('boneIndex', new THREE.BufferAttribute(new Uint8Array(boneIndices), 1));

            if (body.boundingBox) {
                bufferGeometry.boundingBox = body.boundingBox;
                const sphere = new THREE.Sphere();
                bufferGeometry.boundingSphere = body.boundingBox.getBoundingSphere(sphere);
            }

            const modelMesh = new THREE.Mesh(bufferGeometry, material);
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
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
            if (p.hasTransparency || p.hasTex) {
                const uvGroup = getUVGroup(body, p);
                const baseGroup = p.hasTransparency ? 'textured_transparent' : 'textured';
                const group = uvGroup ? `${baseGroup}_${uvGroup.join(',')}` : baseGroup;
                createSubgroupGeometry(geometries, group, baseGroup, uvGroup);
                push.apply(geometries[group].positions, getPosition(body, vertexIndex));
                push.apply(geometries[group].normals, getNormal(body, vertexIndex));
                push.apply(geometries[group].uvs, getUVs(body, p, j));
                push.apply(geometries[group].uvGroups, getUVGroup(body, p));
                push.apply(geometries[group].bones, getBone(body, vertexIndex));
                geometries[group].colors.push(p.colour);
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

        each(sphereGeometry.faces, (f) => {
            addVertex(f.a);
            addVertex(f.b);
            addVertex(f.c);
        });
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

// eslint-disable-next-line no-unused-vars
function debugBoneGeometry(geometries, body) {
    each(body.bones, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(0.001, 8, 8);

        const addVertex = (j) => {
            push.apply(geometries.colored.positions, [
                sphereGeometry.vertices[j].x + centerPos[0],
                sphereGeometry.vertices[j].y + centerPos[1],
                sphereGeometry.vertices[j].z + centerPos[2]
            ]);
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
