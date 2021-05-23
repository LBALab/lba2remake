import * as THREE from 'three';
import { LIQUID_TYPES } from './ground';
import { WORLD_SIZE, getPositions } from '../../../utils/lba';
import { BehaviourMode } from '../../loop/hero';
import { AnimType } from '../../data/animType';
import IslandLayout, { IslandSection } from './IslandLayout';
import Scene from '../../Scene';
import { Time } from '../../../datatypes';
import Actor from '../../Actor';
import Extra from '../../Extra';
import HeightMap from './physics/HeightMap';
import GroundInfo from './physics/GroundInfo';

const POSITION = new THREE.Vector3();
const P0 = new THREE.Vector3();
const P1 = new THREE.Vector3();
const FLAGS = {
    hitObject: false
};
const DEFAULT_FLOOR_THRESHOLD = 0.001;

// Vertical height offsets for the jet/protopack.
const JETPACK_OFFSET = 0.5;
const PROTOPACK_OFFSET = 0.1;
// How fast we reach top vertical height when starting to jetpack.
const JETPACK_VERTICAL_SPEED = 7.5;

const GRID_SCALE = 32 / WORLD_SIZE;
const GRID_UNIT = 1 / 64;
const Y_THRESHOLD = WORLD_SIZE / 1600;

export default class IslandPhysics {
    heightmap: HeightMap;
    private sections: IslandSection[] = [];
    private ground = new GroundInfo();
    private ground2 = new GroundInfo();

    constructor(layout: IslandLayout) {
        for (const section of layout.groundSections) {
            const { x, z } = section;
            const sX = 16 - (x + 8);
            const sZ = z + 8;
            this.sections[sX * 16 + sZ] = section;
        }
        this.heightmap = new HeightMap(this.sections);
    }

    getNormal(
        scene: Scene,
        position: THREE.Vector3,
        boundingBox: THREE.Box3,
        result: THREE.Vector3
    ) {
        POSITION.copy(position);
        POSITION.add(scene.sceneNode.position);

        this.heightmap.getGroundInfo(POSITION, this.ground);
        if (this.ground.valid && position.y - this.ground.height < 0.1) {
            const { points } = this.ground;
            P0.copy(points[1]).sub(points[0]);
            P1.copy(points[2]).sub(points[0]);
            result.crossVectors(P0, P1).normalize();
            return true;
        }

        if (!this.ground.section) {
            return false;
        }

        ACTOR_BOX.copy(boundingBox);
        ACTOR_BOX.translate(POSITION);
        for (const obj of this.ground.section.objects) {
            const bb = obj.boundingBox;
            if (ACTOR_BOX.intersectsBox(bb)) {
                INTERSECTION.copy(ACTOR_BOX);
                INTERSECTION.intersect(bb);
                INTERSECTION.getSize(ITRS_SIZE);
                ACTOR_BOX.getCenter(CENTER1);
                bb.getCenter(CENTER2);
                const dir = CENTER1.sub(CENTER2);
                if (ACTOR_BOX.min.y < bb.max.y - H_THRESHOLD) {
                    if (ITRS_SIZE.x < ITRS_SIZE.z) {
                        result.set(1 * Math.sign(dir.x), 0, 0);
                    } else {
                        result.set(0, 0, 1 * Math.sign(dir.z));
                    }
                } else {
                    result.set(0, 1 * Math.sign(dir.y), 0);
                }
                return true;
            }
        }
        return false;
    }

    processCollisions(scene: Scene, obj: Actor | Extra, time: Time) {
        if (!obj.props.flags.hasCollisionBricks) {
            return false;
        }

        POSITION.copy(obj.physics.position);
        POSITION.add(scene.sceneNode.position);

        const section = this.findSection(POSITION);

        FLAGS.hitObject = false;
        this.getGround(section, POSITION, this.ground);
        let height = this.ground.height;

        obj.state.distFromGround = Math.max(obj.physics.position.y - height, 0);
        const distFromFloor = this.getDistFromFloor(scene, obj);
        obj.state.distFromFloor = distFromFloor;

        let isTouchingGround = true;
        if (obj.physics.position.y > height) {
            isTouchingGround = false;
        }

        const isUsingProtoOrJetpack = obj instanceof Actor &&
            (obj.props.entityIndex === BehaviourMode.JETPACK ||
            obj.props.entityIndex === BehaviourMode.PROTOPACK) &&
            obj.props.animIndex === AnimType.FORWARD;

        if (obj instanceof Actor)
            obj.state.isUsingProtoOrJetpack = isUsingProtoOrJetpack;

        if (isUsingProtoOrJetpack) {
            let heightOffset = PROTOPACK_OFFSET;
            if (obj instanceof Actor && obj.props.entityIndex === BehaviourMode.JETPACK) {
                heightOffset = JETPACK_OFFSET;
            }
            const minFunc = (a, b) => a < b;
            const floorHeight = this.getFloorHeight(scene, obj, minFunc, heightOffset);

            // Only let Twinsen Jetpack over small objects.
            if (floorHeight - obj.physics.position.y < heightOffset) {
                height = floorHeight + heightOffset;
                // Gradually converge on the desired value of height. This means we
                // don't immediately jump to `height` but rather "fly" up to it.
                const diff = height - obj.physics.position.y;
                if (diff <= 0) {
                    obj.physics.position.y -= JETPACK_VERTICAL_SPEED * time.delta;
                    obj.physics.position.y = Math.max(height, obj.physics.position.y);
                } else {
                    obj.physics.position.y += JETPACK_VERTICAL_SPEED * time.delta;
                    obj.physics.position.y = Math.min(height, obj.physics.position.y);
                }
            }  else {
                obj.physics.position.y = Math.max(height, obj.physics.position.y);
            }
        } else {
            obj.physics.position.y = Math.max(height, obj.physics.position.y);
        }

        POSITION.y = obj.physics.position.y;

        if (obj instanceof Actor) {
            obj.state.floorSound = -1;
        }

        if (section) {
            if (obj instanceof Actor) {
                obj.state.floorSound = this.ground.sound;
            }

            isTouchingGround = processBoxIntersections(section, obj, POSITION, isTouchingGround);
            if ((obj.state.isTouchingGround || isTouchingGround) && !FLAGS.hitObject) {
                isTouchingGround = this.heightmap.processCollisions(
                    scene,
                    obj,
                    isTouchingGround,
                    time
                );
            }
        }
        obj.state.isTouchingGround = isTouchingGround;
        obj.state.isTouchingFloor = distFromFloor < 0.001;

        if (obj instanceof Actor && isTouchingGround && this.ground.liquid > 0) {
            switch (this.ground.liquid) {
                case LIQUID_TYPES.WATER:
                    obj.state.isDrowning = true;
                    break;
                case LIQUID_TYPES.LAVA:
                    obj.state.isDrowningLava = true;
                    break;
                default:
                    obj.state.isDrowning = true;
                    break;
            }
        }
        return isTouchingGround;
    }

    processCameraCollisions(camPosition: THREE.Vector3, groundOffset = 0.15, objOffset = 0.2) {
        const section = this.findSection(camPosition);
        this.heightmap.getGroundInfo(camPosition, this.ground);
        camPosition.y = Math.max(this.ground.height + groundOffset * WORLD_SIZE, camPosition.y);
        if (section) {
            for (const obj of section.objects) {
                const bb = obj.boundingBox;
                if (bb.containsPoint(camPosition)) {
                    camPosition.y = bb.max.y + objOffset * WORLD_SIZE;
                }
            }
        }
    }

    // getDistFromFloor returns the distance Twinsen is from the "floor" where floor
    // means any object which Twinsen could stand on between him and the ground, or
    // the ground if none exist.
    getDistFromFloor(scene: Scene, obj) {
        if (!obj.model) {
            return;
        }

        const originalPos = new THREE.Vector3();
        originalPos.copy(obj.physics.position);
        originalPos.add(scene.sceneNode.position);
        const minFunc = (a, b) => a > b;
        const floorHeight = this.getFloorHeight(scene, obj, minFunc, DEFAULT_FLOOR_THRESHOLD);
        return originalPos.y - floorHeight;
    }

    private getGround(section: IslandSection, position: THREE.Vector3, result: GroundInfo) {
        if (!section) {
            result.setDefault();
            return;
        }

        const { x, y, z } = position;
        const yMinusThreshold = y - Y_THRESHOLD;

        for (const obj of section.objects) {
            const bb = obj.boundingBox;
            if (x >= bb.min.x && x <= bb.max.x
                && z >= bb.min.z && z <= bb.max.z
                && y >= bb.min.y && yMinusThreshold < bb.max.y) {
                FLAGS.hitObject = true;
                result.setFromIslandObject(section, obj);
                return;
            }
        }
        this.heightmap.getGroundInfo(position, result);
    }

    // getFloorHeight returns the height of the floor below Twinsen. Note that this
    // may be the height of the ground, or an object Twinsen is stood on. minFunc
    // determines which of the 4 points of the base bounding box we should use and
    // is intended to be either a < or > function of two arguments.
    private getFloorHeight(scene: Scene, obj, minFunc, floorThreshold) {
        const originalPos = new THREE.Vector3();
        originalPos.copy(obj.physics.position);
        originalPos.add(scene.sceneNode.position);
        ACTOR_BOX.copy(obj.model.boundingBox);
        ACTOR_BOX.translate(originalPos);

        // It's not enough to just check for the exact position Twinsen is at.
        // There are cases where we run over a gap in the geometry so we need
        // to check all 4 points of Twinsens bounding box and take the max. I.e.
        // if any point is touching the floor we consider Twinsen touching the
        // floor.
        let overallHeight = -1;
        for (const pos of getPositions(ACTOR_BOX)) {
            const section = this.findSection(pos);
            this.getGround(section, pos, this.ground2);
            if (minFunc(this.ground2.height, overallHeight) || overallHeight === -1) {
                overallHeight = this.ground2.height;
            }
        }
        // If Twinsen is touching the ground we don't need to check if any
        // objects are under him.
        if (originalPos.y - overallHeight <= floorThreshold) {
            return overallHeight;
        }

        // Otherwise, check to see if there are any objects under Twinsen which
        // would be considered the floor.
        POSITION.copy(obj.physics.position);
        POSITION.add(scene.sceneNode.position);
        while (true) {
            if (POSITION.y < 0) {
                break;
            }

            ACTOR_BOX.copy(obj.model.boundingBox);
            ACTOR_BOX.translate(POSITION);
            const section = this.findSection(POSITION);
            if (section) {
                for (const iObj of section.objects) {
                    const bb = iObj.boundingBox;
                    if (ACTOR_BOX.intersectsBox(bb)) {
                        return bb.max.y;
                    }
                }
            }
            POSITION.y -= 0.1;
        }

        // No objects were under Twinsen, return distance from the ground.
        return overallHeight;
    }

    findSection(position): IslandSection {
        const x = Math.floor(position.x * GRID_SCALE);
        const z = Math.floor(position.z * GRID_SCALE);
        const sX = Math.floor((x - 1) * GRID_UNIT);
        const sZ = Math.floor(z * GRID_UNIT);
        const iX = 16 - (sX + 8);
        const iZ = sZ + 8;
        return this.sections[iX * 16 + iZ];
    }
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();
const H_THRESHOLD = 0.007 * WORLD_SIZE;

function processBoxIntersections(
    section: IslandSection,
    obj: Actor | Extra,
    position: THREE.Vector3,
    isTouchingGround: boolean
) {
    const boundingBox = obj.model || obj instanceof Extra
        ? obj.model.boundingBox
        : obj.sprite.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.translate(position);
    let collision = false;
    for (const islandObj of section.objects) {
        const bb = islandObj.boundingBox;
        if (ACTOR_BOX.intersectsBox(bb)) {
            collision = true;
            isTouchingGround = true;
            INTERSECTION.copy(ACTOR_BOX);
            INTERSECTION.intersect(bb);
            INTERSECTION.getSize(ITRS_SIZE);
            ACTOR_BOX.getCenter(CENTER1);
            bb.getCenter(CENTER2);
            const dir = CENTER1.sub(CENTER2);
            if (ACTOR_BOX.min.y < bb.max.y - H_THRESHOLD) {
                if (ITRS_SIZE.x < ITRS_SIZE.z) {
                    DIFF.set(ITRS_SIZE.x * Math.sign(dir.x), 0, 0);
                } else {
                    DIFF.set(0, 0, ITRS_SIZE.z * Math.sign(dir.z));
                }
            } else {
                DIFF.set(0, ITRS_SIZE.y * Math.sign(dir.y), 0);
                isTouchingGround = false;
            }
            obj.physics.position.add(DIFF);
            position.add(DIFF);
            ACTOR_BOX.translate(DIFF);
        }
    }
    // don't let objects go to abysm
    if (!isTouchingGround && obj.physics.position.y < 0) {
        isTouchingGround = true;
    }
    obj.state.isColliding = collision;
    return isTouchingGround;
}
