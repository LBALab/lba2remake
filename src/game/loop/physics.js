import THREE from 'three';
import {each, find} from 'lodash';

export function processPhysicsFrame(game, scene) {
    each(scene.actors, actor => {
        processActorPhysics(actor, scene);
    });
    if (scene.isActive) {
        processTeleports(game, scene);
    }
}

const el = document.createElement('div');
el.style.background = 'black';
el.style.color = 'white';
el.style.position = 'fixed';
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(el);
});

const tgt = new THREE.Vector3();
const position = new THREE.Vector3();

function processActorPhysics(actor, scene) {
    actor.physics.position.add(actor.physics.temp.position);
    if (scene.isIsland && actor.threeObject) {
        tgt.copy(actor.physics.position);
        tgt.sub(actor.threeObject.position);
        tgt.setY(0);
        let tgtInfo = null;
        if (tgt.lengthSq() != 0) {
            tgt.normalize();
            tgt.multiplyScalar(0.02);
            tgt.add(actor.threeObject.position);
            tgt.applyMatrix4(scene.sceneNode.matrixWorld);
            tgtInfo = scene.scenery.physics.getGroundInfo(tgt.x, tgt.z);
            if (tgtInfo.collision) {
                actor.physics.position.copy(actor.threeObject.position);
            }
        }
        position.copy(actor.physics.position);
        position.applyMatrix4(scene.sceneNode.matrixWorld);
        const info = scene.scenery.physics.getGroundInfo(position.x, position.z);
        const height = info.height;
        actor.physics.position.y = height;
        actor.threeObject.position.y = height;
        if (actor.model) {
            actor.model.flag.value = tgtInfo && tgtInfo.collision || 0.0;
        }
        if (actor.index == 0 && scene.isActive) {
            el.innerText = info.sound;
            if (tgtInfo) {
                el.innerText += ` [${tgt.x.toFixed(2)}, ${tgt.z.toFixed(2)}] [${position.x.toFixed(2)}, ${position.z.toFixed(2)}]`;
            }
        }
    }
    if (actor.model) {
        actor.model.mesh.quaternion.copy(actor.physics.orientation);
        actor.model.mesh.position.copy(actor.physics.position);
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
    for (let i = 0; i < scene.zones.length; ++i) {
        const zone = scene.zones[i];
        if (zone.props.type != 0 || (scene.sideScenes && zone.props.snap in scene.sideScenes))
            continue;

        const box = zone.props.box;
        if (pos.x > Math.min(box.bX, box.tX) && pos.x < Math.max(box.bX, box.tX) &&
            pos.y > Math.min(box.bY, box.tY) && pos.y < Math.max(box.bY, box.tY) &&
            pos.z > Math.min(box.bZ, box.tZ) && pos.z < Math.max(box.bZ, box.tZ)) {
            game.getSceneManager().goto(zone.props.snap, (newScene) => {
                const newHero = newScene.getActor(0);
                newHero.physics.position.x = (0x8000 - zone.props.info2 + 512) / 0x4000;
                newHero.physics.position.y = zone.props.info1 / 0x4000;
                newHero.physics.position.z = zone.props.info0 / 0x4000;
                newHero.physics.temp.angle = hero.physics.temp.angle;
                newHero.physics.orientation.copy(hero.physics.orientation);
                newHero.threeObject.position.copy(newHero.physics.position);
            });
            break;
        }
    }
}