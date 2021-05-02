import * as THREE from 'three';
import { each, times } from 'lodash';

import { GROUND_TYPES } from './grid';
import { compile } from '../../../utils/shaders';
import brick_vertex from './shaders/brick.vert.glsl';
import brick_fragment from './shaders/brick.frag.glsl';
import dome_brick_vertex from './shaders/dome_brick.vert.glsl';
import dome_brick_fragment from './shaders/dome_brick.frag.glsl';
import { extractBricksReplacementInfo } from './metadata';
import { Side, OffsetBySide } from './mapping';
import { WORLD_SCALE_B, WORLD_SIZE } from '../../../utils/lba';
import Game from '../../Game';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import Renderer from '../../../renderer';
import { loadModel } from './metadata/models';
import { getParams } from '../../../params';
import { replaceMaterialsForPreview } from './metadata/preview';

export async function loadMesh(grid, entry, ambience, gridMetadata, is3D, editorData, numActors) {
    const threeObject = new THREE.Object3D();
    const geometries = {
        standard: {
            positions: [],
            uvs: [],
            flags: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', brick_vertex),
                fragmentShader: compile('frag', brick_fragment),
                transparent: true,
                uniforms: {
                    library: { value: grid.library.texture }
                },
                defines: {},
                glslVersion: Renderer.getGLSLVersion(),
                side: THREE.DoubleSide
            })
        },
        dome_ground: null
    };
    const {library, cells} = grid;
    const bricksReplInfo = await extractBricksReplacementInfo(
        grid,
        entry,
        ambience,
        is3D,
        !!editorData,
        numActors
    );
    const replacementMesh = bricksReplInfo.replacements.threeObject;
    if (replacementMesh) {
        threeObject.add(replacementMesh);
    }

    if (editorData) {
        const material = geometries.standard.material;
        const uniforms = material.uniforms;
        material.defines.GRID_EDITOR = true;
        uniforms.mode = { value: 0 };
        editorData.mode = uniforms.mode;
        editorData.replacementMesh = replacementMesh;
        editorData.bricksMap = new Map<string, any>();
    }

    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            buildColumn(
                grid,
                library,
                cells,
                geometries,
                x,
                z,
                bricksReplInfo,
                editorData,
                is3D,
                numActors
            );
        }
    }

    each(geometries, (geom, name) => {
        if (!geom) {
            return;
        }
        const {positions, uvs, flags, material} = geom;
        if (positions.length === 0) {
            return;
        }

        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        );
        bufferGeometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), 2)
        );
        if (editorData && flags) {
            bufferGeometry.setAttribute(
                'flag',
                new THREE.BufferAttribute(new Uint8Array(flags), 1)
            );
        }
        const mesh = new THREE.Mesh(bufferGeometry, material);

        if (editorData && name === 'standard') {
            editorData.bricksGeom = bufferGeometry;
        }

        mesh.frustumCulled = false;
        mesh.name = `iso_grid_${name}`;
        threeObject.add(mesh);
    });

    threeObject.name = `scenery_iso_${entry}`;
    threeObject.scale.set(WORLD_SCALE_B, WORLD_SCALE_B, WORLD_SCALE_B);
    threeObject.position.set(WORLD_SIZE * 2, 0, 0);
    threeObject.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2.0);

    const extra_meshes = [];
    if (is3D) {
        const { game } = getParams();
        if (editorData) {
            editorData.models = new Set();
        }
        for (const model of gridMetadata.models) {
            const gltf = await loadModel(`/models/${game}/layouts/${model.name}`, false);
            const mesh = gltf.scene;
            mesh.name = model.name;
            mesh.position.copy(model.position);
            mesh.quaternion.fromArray(model.quaternion);
            mesh.scale.setScalar(1 / 0.75);
            threeObject.add(mesh);
            replaceMaterialsForPreview(mesh, bricksReplInfo.replacements.data);
            if (editorData) {
                editorData.models.add(mesh);
            }
            mesh.userData.position = mesh.position.clone();
            mesh.userData.quaternion = mesh.quaternion.clone();
            extra_meshes.push(mesh);
        }
    }

    let frameCount = 0;

    return {
        threeObject,
        editorData,
        update: (game: Game, scene: Scene, time: Time) => {
            // This is a hack to make sure the scene is properly settled
            // when setting the material. For some reason if done on the
            // first frame or before, the normals are wrong and lighting
            // is messed up.
            if (frameCount < 2) {
                for (const mesh of extra_meshes) {
                    mesh.traverse((node) => {
                        node.updateMatrix();
                        node.updateMatrixWorld(true);
                        if (node instanceof THREE.Mesh &&
                            node.material instanceof THREE.RawShaderMaterial) {
                            const material = node.material as THREE.RawShaderMaterial;
                            material.uniforms.uNormalMatrix.value.setFromMatrix4(
                                node.matrixWorld
                            );
                        }
                    });
                }
                frameCount += 1;
            }
            if (game) {
                const { update } = bricksReplInfo.replacements;
                if (update) {
                    update(game, scene, time);
                }
                if (geometries.dome_ground) { // dome
                    const slateUniforms = geometries.dome_ground.material.uniforms;
                    scene.actors.forEach((actor, idx) => {
                        if (actor.threeObject && !actor.state.isDead) {
                            slateUniforms.actorPos.value[idx].set(0, 0, 0);
                            slateUniforms.actorPos.value[idx]
                                .applyMatrix4(actor.threeObject.matrixWorld);
                        } else {
                            // Make it far
                            slateUniforms.actorPos.value[idx].set(-1000, -1000, -1000);
                        }
                    });
                }
            }
        }
    };
}

function buildColumn(
    grid,
    library,
    cells,
    geometries,
    x,
    z,
    bricksReplInfo,
    editorData,
    is3D,
    numActors
) {
    const h = 0.5;
    const {width, height} = library.texture.image;
    const {replacements, mirrors} = bricksReplInfo;
    const blocks = cells[z * 64 + x].blocks;

    const pushMirror = (layout, sides, handler) => {
        const rBlocks = cells[sides[2] * 64 + sides[0]].blocks;
        if (rBlocks[sides[1]]) {
            const def = rBlocks[sides[1]];
            const rBlock = layout.blocks[def.block];
            const { uvs } = geometries[getGeometryType(rBlock)];
            if (rBlock && rBlock.brick in library.bricksMap) {
                const {u, v} = library.bricksMap[rBlock.brick];
                const pushUvM = (u0, v0, side) => {
                    const o = OffsetBySide[side];
                    uvs.push((u + u0 + o.x) / width, (v + v0 + o.y) / height);
                };
                handler(pushUvM);
            }
        }
    };

    const zPos = z - 1;
    for (let y = 0; y < blocks.length; y += 1) {
        const yPos = (y * h) + h;
        if (blocks[y]) {
            if (is3D && blocks[y].hide && !editorData) {
                continue;
            }
            const layout = library.layouts[blocks[y].layout];
            if (layout) {
                const key = `${x},${y},${z}`;
                let replaced = false;
                if (replacements && replacements.bricks && replacements.bricks.has(key)) {
                    replaced = true;
                    if (!editorData) {
                        continue;
                    }
                }

                const block = layout.blocks[blocks[y].block];
                const type = getGeometryType(block);
                if (type === 'dome_ground' && !geometries.dome_ground) {
                    geometries.dome_ground = {
                        positions: [],
                        uvs: [],
                        material: new THREE.RawShaderMaterial({
                            defines: {
                                NUM_ACTORS: numActors
                            },
                            vertexShader: dome_brick_vertex,
                            fragmentShader: dome_brick_fragment,
                            transparent: true,
                            uniforms: {
                                library: { value: grid.library.texture },
                                actorPos: { value: times(numActors, () => new THREE.Vector3()) },
                            },
                            side: THREE.DoubleSide
                        })
                    };
                }
                const { uvs, positions, flags } = geometries[type];
                if (block && block.brick in library.bricksMap) {
                    const {u, v} = library.bricksMap[block.brick];
                    const pushUv = (u0, v0, side) => {
                        const o = OffsetBySide[side];
                        uvs.push((u + u0 + o.x) / width, (v + v0 + o.y) / height);
                    };

                    let flag = 0;
                    if (blocks[y].hide) {
                        flag = 2;
                    } else if (replaced) {
                        flag = 1;
                    }

                    let brickData = null;
                    if (editorData) {
                        brickData = {
                            start: flags.length,
                            end: flags.length
                        };
                        editorData.bricksMap.set(key, brickData);
                    }

                    const pushNFlags = (num) => {
                        if (editorData) {
                            for (let i = 0; i < num; i += 1) {
                                flags.push(flag);
                            }
                            brickData.end += num;
                        }
                    };

                    positions.push(x, yPos, zPos);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x, yPos, zPos + 1);
                    pushUv(48, 11.5, Side.TOP);
                    positions.push(x + 1, yPos, zPos + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x, yPos, zPos);
                    pushUv(24, -0.5, Side.TOP);
                    positions.push(x + 1, yPos, zPos + 1);
                    pushUv(24, 23.5, Side.TOP);
                    positions.push(x + 1, yPos, zPos);
                    pushUv(0, 11.5, Side.TOP);

                    positions.push(x + 1, yPos, zPos);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, yPos, zPos + 1);
                    pushUv(24, 23.5, Side.LEFT);
                    positions.push(x + 1, yPos - h, zPos + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, yPos, zPos);
                    pushUv(0, 11.5, Side.LEFT);
                    positions.push(x + 1, yPos - h, zPos + 1);
                    pushUv(24, 38.5, Side.LEFT);
                    positions.push(x + 1, yPos - h, zPos);
                    pushUv(0, 26.5, Side.LEFT);

                    positions.push(x, yPos, zPos + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x + 1, yPos - h, zPos + 1);
                    pushUv(24, 38.5, Side.RIGHT);
                    positions.push(x + 1, yPos, zPos + 1);
                    pushUv(24, 23.5, Side.RIGHT);
                    positions.push(x, yPos, zPos + 1);
                    pushUv(48, 11.5, Side.RIGHT);
                    positions.push(x, yPos - h, zPos + 1);
                    pushUv(48, 26.5, Side.RIGHT);
                    positions.push(x + 1, yPos - h, zPos + 1);
                    pushUv(24, 38.5, Side.RIGHT);

                    pushNFlags(18);

                    const mirror = mirrors && mirrors[key];
                    if (mirror && !replaced) {
                        if (mirror[0]) {
                            pushMirror(layout, mirror[0], (pushUvM) => {
                                positions.push(x, yPos, zPos);
                                pushUvM(0, 11.5, Side.LEFT);
                                positions.push(x, yPos, zPos + 1);
                                pushUvM(24, 23.5, Side.LEFT);
                                positions.push(x, yPos - h, zPos + 1);
                                pushUvM(24, 38.5, Side.LEFT);
                                positions.push(x, yPos, zPos);
                                pushUvM(0, 11.5, Side.LEFT);
                                positions.push(x, yPos - h, zPos + 1);
                                pushUvM(24, 38.5, Side.LEFT);
                                positions.push(x, yPos - h, zPos);
                                pushUvM(0, 26.5, Side.LEFT);
                                pushNFlags(6);
                            });
                        }

                        if (mirror[1]) {
                            pushMirror(layout, mirror[1], (pushUvM) => {
                                positions.push(x, yPos - h, zPos);
                                pushUvM(24, -0.5, Side.TOP);
                                positions.push(x, yPos - h, zPos + 1);
                                pushUvM(48, 11.5, Side.TOP);
                                positions.push(x + 1, yPos - h, zPos + 1);
                                pushUvM(24, 23.5, Side.TOP);
                                positions.push(x, yPos - h, zPos);
                                pushUvM(24, -0.5, Side.TOP);
                                positions.push(x + 1, yPos - h, zPos + 1);
                                pushUvM(24, 23.5, Side.TOP);
                                positions.push(x + 1, yPos - h, zPos);
                                pushUvM(0, 11.5, Side.TOP);
                                pushNFlags(6);
                            });
                        }

                        if (mirror[2]) {
                            pushMirror(layout, mirror[2], (pushUvM) => {
                                positions.push(x, yPos, zPos);
                                pushUvM(48, 11.5, Side.RIGHT);
                                positions.push(x + 1, yPos - h, zPos);
                                pushUvM(24, 38.5, Side.RIGHT);
                                positions.push(x + 1, yPos, zPos);
                                pushUvM(24, 23.5, Side.RIGHT);
                                positions.push(x, yPos, zPos);
                                pushUvM(48, 11.5, Side.RIGHT);
                                positions.push(x, yPos - h, zPos);
                                pushUvM(48, 26.5, Side.RIGHT);
                                positions.push(x + 1, yPos - h, zPos);
                                pushUvM(24, 38.5, Side.RIGHT);
                                pushNFlags(6);
                            });
                        }
                    }
                }
            }
        }
    }
}

function getGeometryType(block) {
    switch (block && block.groundType) {
        case GROUND_TYPES.DOME_OF_THE_SLATE_FLOOR:
            return 'dome_ground';
    }
    return 'standard';
}
