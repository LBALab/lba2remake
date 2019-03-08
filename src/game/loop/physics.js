import * as THREE from 'three';
import {each, find} from 'lodash';
import { DirMode } from '../actors.ts';

import {processZones} from './zones';

export function processPhysicsFrame(game, scene, time) {
    scene.sceneNode.updateMatrixWorld();
    each(scene.actors, (actor) => {
        processActorPhysics(scene, actor, time);
    });
    if (scene.isActive) {
        processZones(game, scene);
        processSidesceneTransitions(scene);
    }
}

function processActorPhysics(scene, actor, time) {
    if (!actor.model || actor.isKilled)
        return;

    actor.physics.position.add(actor.physics.temp.position);
    if (actor.props.flags.hasCollisions) {
        if (!actor.props.runtimeFlags.hasGravityByAnim
            && actor.props.flags.canFall
            && actor.props.dirMode !== DirMode.NO_MOVE) {
            actor.physics.position.y -= 6 * time.delta;
        }
        scene.scenery.physics.processCollisions(scene, actor);
        processCollisionsWithActors(scene, actor);
    }
    actor.model.mesh.quaternion.copy(actor.physics.orientation);
    actor.model.mesh.position.copy(actor.physics.position);
    if (actor.model.boundingBoxDebugMesh) {
        actor.model.boundingBoxDebugMesh.quaternion.copy(actor.model.mesh.quaternion);
        actor.model.boundingBoxDebugMesh.quaternion.inverse();
    }
}

function processSidesceneTransitions(scene) {
    const hero = scene.actors[0];
    const pos = hero.physics.position.clone();
    pos.y += 0.12;
    if (scene.isIsland && (pos.x < 0.1 || pos.z < 0.1 || pos.x > 47.9 || pos.z > 47.9)) {
        const globalPos = new THREE.Vector3();
        globalPos.applyMatrix4(hero.threeObject.matrixWorld);
        const foundSideScene = find(scene.sideScenes, (sideScene) => {
            const nodePos = sideScene.sceneNode.position;
            return globalPos.x > nodePos.x + 0.1
                && globalPos.x < nodePos.x + 47.9
                && globalPos.z > nodePos.z + 0.1
                && globalPos.z < nodePos.z + 47.9;
        });
        if (foundSideScene) {
            scene.goto(foundSideScene.index, false, false, false);
        }
    }
}

const ACTOR_BOX = new THREE.Box3();
const ACTOR2_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const DIFF = new THREE.Vector3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();

function processCollisionsWithActors(scene, actor) {
    actor.hasCollidedWithActor = -1;
    if (actor.model === null || actor.isKilled || !actor.props.flags.hasCollisions) {
        return;
    }
    ACTOR_BOX.copy(actor.model.boundingBox);
    ACTOR_BOX.translate(actor.physics.position);
    DIFF.set(0, 1 / 128, 0);
    ACTOR_BOX.translate(DIFF);
    for (let i = 0; i < scene.actors.length; i += 1) {
        const a = scene.actors[i];
        if (a.model === null
            || a.index === actor.index
            || a.isKilled
            || !a.props.flags.hasCollisions) {
            continue;
        }
        INTERSECTION.copy(a.model.boundingBox);
        INTERSECTION.translate(a.physics.position);
        DIFF.set(0, 1 / 128, 0);
        INTERSECTION.translate(DIFF);
        ACTOR2_BOX.copy(INTERSECTION);
        if (ACTOR2_BOX.intersectsBox(ACTOR_BOX)) {
            INTERSECTION.intersect(ACTOR_BOX);
            INTERSECTION.getSize(ITRS_SIZE);
            ACTOR_BOX.getCenter(CENTER1);
            ACTOR2_BOX.getCenter(CENTER2);
            const dir = CENTER1.sub(CENTER2);
            if (actor.physics.position.y < ACTOR2_BOX.max.y - 0.015) {
                if (ITRS_SIZE.x < ITRS_SIZE.z) {
                    DIFF.set(ITRS_SIZE.x * Math.sign(dir.x), 0, 0);
                } else {
                    DIFF.set(0, 0, ITRS_SIZE.z * Math.sign(dir.z));
                }
            }
            actor.physics.position.add(DIFF);
            ACTOR_BOX.translate(DIFF);
            actor.hasCollidedWithActor = a.index;
        }
    }
}
