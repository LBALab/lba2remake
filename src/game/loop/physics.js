import THREE from 'three';
import {each, find} from 'lodash';

import {getHtmlColor} from '../../scene'

export function processPhysicsFrame(game, scene, time) {
    scene.sceneNode.updateMatrixWorld();
    each(scene.actors, actor => {
        processActorPhysics(scene, actor, time);
    });
    if (scene.isActive) {
        processTeleports(game, scene);
        processZones(game, scene);
    }
}

function processActorPhysics(scene, actor, time) {
    if (!actor.model || actor.isKilled)
        return;

    actor.physics.position.add(actor.physics.temp.position);
    if (actor.props.flags.hasCollisions) {
        actor.physics.position.y -= 0.4 * time.delta;
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

function processTeleports(game, scene) {
    const hero = scene.getActor(0);
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    if (scene.isIsland && (pos.x < 0 || pos.z < 0 || pos.x > 2 || pos.z > 2)) {
        const globalPos = new THREE.Vector3();
        globalPos.applyMatrix4(hero.threeObject.matrixWorld);
        const sideScene = find(scene.sideScenes, sideScene => {
            const nodePos = sideScene.sceneNode.position;
            return globalPos.x > nodePos.x
                && globalPos.x < nodePos.x + 2
                && globalPos.z > nodePos.z
                && globalPos.z < nodePos.z + 2;
        });
        if (sideScene) {
            game.getSceneManager().goto(sideScene.index, (newScene) => {
                const newHero = newScene.getActor(0);
                newHero.threeObject.quaternion.copy(hero.threeObject.quaternion);
                newHero.threeObject.position.copy(globalPos);
                newHero.threeObject.position.sub(newScene.sceneNode.position);
                newHero.physics.position.copy(newHero.threeObject.position);
                newHero.physics.temp.angle = hero.physics.temp.angle;
                newHero.physics.orientation.copy(hero.physics.orientation);
                newHero.props.dirMode = hero.props.dirMode;
            });
            return;
        }
    }
}

function processZones(game, scene) {
    const hero = scene.getActor(0);
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    for (let i = 0; i < scene.zones.length; ++i) {
        const zone = scene.zones[i];
        const box = zone.props.box;
        if (pos.x > Math.min(box.bX, box.tX) && pos.x < Math.max(box.bX, box.tX) &&
            pos.y > Math.min(box.bY, box.tY) && pos.y < Math.max(box.bY, box.tY) &&
            pos.z > Math.min(box.bZ, box.tZ) && pos.z < Math.max(box.bZ, box.tZ)) {
            // improve this
            if (zone.props.type == 0 && !(scene.sideScenes && zone.props.snap in scene.sideScenes)) {
                game.getSceneManager().goto(zone.props.snap, (newScene) => {
                    const newHero = newScene.getActor(0);
                    newHero.physics.position.x = (0x8000 - zone.props.info2 + 511) / 0x4000;
                    newHero.physics.position.y = zone.props.info1 / 0x4000;
                    newHero.physics.position.z = zone.props.info0 / 0x4000;
                    newHero.physics.temp.angle = hero.physics.temp.angle;
                    newHero.physics.orientation.copy(hero.physics.orientation);
                    newHero.threeObject.position.copy(newHero.physics.position);
                });
            }
            if (zone.props.type == 5) {
                processZoneText(game, scene, zone);
            }
            break;
        }
    }
}

function processZoneText(game, scene, zone) {
    if (game.controlsState.action == 1) {
        const voiceSource = game.getAudioManager().getVoiceSource();
        if (!scene.zoneState.listener) {
            const textBox = document.getElementById('smallText');
            textBox.style.display = 'block';
            textBox.style.color = getHtmlColor(scene.data.palette, zone.props.info0 * 16 + 12);
            textBox.innerHTML = scene.data.texts[zone.props.snap].value;
            scene.zoneState.listener = function() {
                scene.zoneState.ended = true;
            };
            window.addEventListener('keydown', scene.zoneState.listener);
            voiceSource.load(scene.data.texts[zone.props.snap].index, scene.data.textBankId, () => {
                voiceSource.play();
            });
        }
    }
    if (scene.zoneState.ended) {
        //voiceSource.stop();
        const textBox = document.getElementById('smallText');
        textBox.style.display = 'none';
        textBox.innerHTML = '';
        window.removeEventListener('keydown', scene.zoneState.listener);
        delete scene.zoneState.listener;
        delete scene.zoneState.ended;
    }
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const DIFF = new THREE.Vector3();

function processCollisionsWithActors(scene, actor) {
    actor.hasCollidedWithActor = -1;
    if (actor.model == null) {
        return;
    }
    ACTOR_BOX.copy(actor.model.boundingBox);
    ACTOR_BOX.translate(actor.physics.position);
    DIFF.set(0, 1 / 128, 0);
    ACTOR_BOX.translate(DIFF);
    for (let i = 0; i < scene.actors.length; ++i) {
        const a = scene.actors[i];
        if (a.model == null || a.index == actor.index) {
            continue;
        }
        INTERSECTION.copy(a.model.boundingBox);
        INTERSECTION.translate(a.physics.position);
        DIFF.set(0, 1 / 128, 0);
        INTERSECTION.translate(DIFF);
        if (INTERSECTION.intersectsBox(ACTOR_BOX)) {
            actor.hasCollidedWithActor = a.index;
        }
    }
}
