import * as THREE from 'three';
import { times } from 'lodash';
import { WORLD_SIZE } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';
import Scene from '../../../Scene';
import Actor from '../../../Actor';
import Extra from '../../../Extra';
import { scanGrid, intersect2DLines, pointInTriangle2D } from './math';
import GridCell from './GridCell';

const GRID_SCALE = 32 / WORLD_SIZE;
const WORLD_SIZE_M2 = WORLD_SIZE * 2;

const VEC_TMP = new THREE.Vector3();
const OFFSET = new THREE.Vector3();
const TGT_ITRS_PT = times(6).map(() => new THREE.Vector3());
const TGT_PROJ_PT = times(6).map(() => new THREE.Vector3());
const LINE = new THREE.Line3();
const TRIANGLE_SIDE = new THREE.Line3();
const CELL = new GridCell();

export function processHeightmapCollisions(
    scene: Scene,
    section: IslandSection,
    obj: Actor | Extra
) {
    getLocalCoords(scene, section, obj.threeObject.position, LINE.start);
    getLocalCoords(scene, section, obj.physics.position, LINE.end);
    scanGrid(LINE, (x, z) => {
        CELL.setFrom(section, x, z);
        let idx = 0;
        for (const tri of CELL.triangles) {
            if (tri.collision) {
                const { points } = tri;
                let intersect = false;
                for (let i = 0; i < 3; i += 1) {
                    const pt0 = i;
                    const pt1 = (i + 1) % 3;
                    TRIANGLE_SIDE.set(points[pt0], points[pt1]);
                    const t = intersect2DLines(LINE, TRIANGLE_SIDE);
                    if (t !== -1) {
                        TGT_ITRS_PT[idx].copy(LINE.start);
                        VEC_TMP.copy(LINE.end);
                        VEC_TMP.sub(LINE.start);
                        VEC_TMP.multiplyScalar(t);
                        TGT_ITRS_PT[idx].add(VEC_TMP);
                        TRIANGLE_SIDE.closestPointToPoint(
                            LINE.end,
                            true,
                            TGT_PROJ_PT[idx]
                        );
                        idx += 1;
                        intersect = true;
                    }
                }
                if (!intersect) {
                    if (pointInTriangle2D(points, LINE.start)) {
                        return true;
                    }
                }
            }
        }
        let closestIdx = -1;
        let dist = Infinity;
        for (let i = 0; i < idx; i += 1) {
            const nDist = TGT_ITRS_PT[i].distanceToSquared(LINE.start);
            if (nDist < dist) {
                closestIdx = i;
                dist = nDist;
            }
        }
        if (closestIdx !== -1) {
            OFFSET.copy(TGT_PROJ_PT[closestIdx]);
            OFFSET.sub(LINE.end);
            OFFSET.normalize();
            OFFSET.multiplyScalar(0.01);
            LINE.end.copy(TGT_PROJ_PT[closestIdx]);
            LINE.end.add(OFFSET);
            getGlobalCoords(scene, section, LINE.end, obj.physics.position);
            return true;
        }
        return false;
    });
}

function getLocalCoords(
    scene: Scene,
    section: IslandSection,
    src: THREE.Vector3,
    result: THREE.Vector3
) {
    result.copy(src);
    result.add(scene.sceneNode.position);
    result.set(
        ((WORLD_SIZE_M2 - (result.x - (section.x * WORLD_SIZE_M2))) * GRID_SCALE) + 1,
        src.y,
        (result.z - (section.z * WORLD_SIZE_M2)) * GRID_SCALE
    );
}

function getGlobalCoords(
    scene: Scene,
    section: IslandSection,
    src: THREE.Vector3,
    result: THREE.Vector3
) {
    result.copy(src);
    result.set(
        (section.x * WORLD_SIZE_M2) + (WORLD_SIZE_M2 - (((src.x - 1) / GRID_SCALE))),
        src.y,
        (section.z * WORLD_SIZE_M2) + (src.z / GRID_SCALE)
    );
    result.sub(scene.sceneNode.position);
}
