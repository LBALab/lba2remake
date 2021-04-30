import * as THREE from 'three';

import { getGridMetadata } from './grid';
import IsoSceneryPhysics from './IsoSceneryPhysics';
import { WORLD_SIZE, DOME_ENTRIES } from '../../../utils/lba';
import { getPalette, getGrid, getBricks } from '../../../resources';
import { loadDomeEnv } from './misc/dome_env';
import { getParams } from '../../../params';
import Game from '../../Game';
import { loadMesh } from './mesh';
import { loadBrickMask } from './mask';

export default class IsoScenery {
    props: any;
    threeObject: THREE.Object3D;
    physics: IsoSceneryPhysics;
    readonly grid: any;
    private mesh: any;
    private domeEnv?: any;
    editorData: any;

    static async load(game: Game, sceneData): Promise<IsoScenery> {
        const params = getParams();
        return IsoScenery.loadGeneric({
            ...sceneData,
            numActors: sceneData.actors.length,
            is3D: game.vr || params.iso3d || params.isoCam3d
        });
    }

    static async loadForEditor(sceneData): Promise<IsoScenery> {
        return IsoScenery.loadGeneric({
            ...sceneData,
            numActors: 0,
            is3D: true,
            isGridEditor: true,
        });
    }

    private static async loadGeneric(data): Promise<IsoScenery> {
        const { sceneryIndex, ambience, is3D, isGridEditor, numActors } = data;
        const [palette, bricks, gridMetadata, mask] = await Promise.all([
            getPalette(),
            getBricks(),
            getGridMetadata(sceneryIndex),
            loadBrickMask()
        ]);

        const grid = await getGrid(sceneryIndex, {
            bricks,
            mask,
            palette,
            is3D,
            gridMetadata,
            noCache: isGridEditor
        });

        const editorData = isGridEditor ? {} : null;

        const mesh = await loadMesh(grid, sceneryIndex, ambience, is3D, editorData, numActors);

        // Dome of the slate
        let domeEnv = null;
        if (DOME_ENTRIES.includes(sceneryIndex) && is3D) {
            domeEnv = await loadDomeEnv(ambience);
            mesh.threeObject.add(domeEnv.threeObject);
        }

        return new IsoScenery(grid, mesh, domeEnv, editorData);
    }

    constructor(grid, mesh, domeEnv = null, editorData = null) {
        this.props = {
            startPosition: [0, 0],
            envInfo: {
                skyColor: [0, 0, 0],
                fogDensity: 0
            }
        };
        this.grid = grid;
        this.mesh = mesh;
        this.threeObject = mesh.threeObject;
        this.physics = new IsoSceneryPhysics(grid);
        this.domeEnv = domeEnv;
        this.editorData = editorData;
    }

    pickBrick(raycaster: THREE.Raycaster) {
        const tgt = new THREE.Vector3();
        const BB = new THREE.Box3();
        let result = null;
        const { library, cells } = this.grid;
        for (let z = 63; z >= 0; z -= 1) {
            for (let x = 63; x >= 0; x -= 1) {
                const cell = cells[(z * 64) + x];
                if (cell) {
                    const blocks = cell.blocks;
                    for (let y = 0; y < blocks.length; y += 1) {
                        if (blocks[y]) {
                            const layout = library.layouts[blocks[y].layout];
                            if (layout) {
                                BB.min.set((64 - z) / 32, y / 64, x / 32);
                                BB.max.set((65 - z) / 32, (y + 1) / 64, (x + 1) / 32);
                                BB.min.multiplyScalar(WORLD_SIZE);
                                BB.max.multiplyScalar(WORLD_SIZE);
                                const block = layout.blocks[blocks[y].block];
                                if (block && block.brick in library.bricksMap) {
                                    if (raycaster.ray.intersectBox(BB, tgt)) {
                                        const distSq = tgt.distanceToSquared(raycaster.ray.origin);
                                        if (!result || result.distSq > distSq) {
                                            result = {
                                                x,
                                                y,
                                                z,
                                                block: blocks[y],
                                                blockInfo: block,
                                                distSq,
                                                tgt
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    getBrickInfo({x, y, z}) {
        const { library, cells } = this.grid;
        const cell = cells[(z * 64) + x];
        if (cell) {
            const blocks = cell.blocks;
            if (blocks[y]) {
                const layout = library.layouts[blocks[y].layout];
                if (layout) {
                    const block = layout.blocks[blocks[y].block];
                    if (block && block.brick in library.bricksMap) {
                        return {
                            x,
                            y,
                            z,
                            block: blocks[y],
                            blockInfo: block,
                        };
                    }
                }
            }
        }
        return null;
    }

    update(game, scene, time) {
        this.mesh.update(game, scene, time);
        if (this.domeEnv) {
            this.domeEnv.update(time);
        }
    }
}
