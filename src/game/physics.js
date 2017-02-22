import THREE from 'three';
import {each, find} from 'lodash';

export function processPhysicsFrame(game, scene, time) {
    const hero = scene.getActor(0);
    processActorPhysics(hero, scene);
    processTeleports(game, hero, scene);
}

function processActorPhysics(actor, scene) {
    if (scene.isIsland) {
        const position = new THREE.Vector3();
        position.applyMatrix4(actor.threeObject.matrixWorld);
        const height = scene.scenery.physics.getGroundHeight(position.x, position.z);
        actor.physics.position.y = height;
        actor.threeObject.position.y = height;
    }
}

function processTeleports(game, hero, scene) {
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
                newHero.threeObject.position.copy(globalPos);
                newHero.threeObject.position.sub(newScene.sceneNode.position);
                newHero.physics.position.copy(newHero.threeObject.position);
                newHero.physics.temp.angle = hero.physics.temp.angle;
                newHero.physics.orientation.copy(hero.physics.orientation);
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
            game.getSceneManager().goto(zone.props.snap);
            break;
        }
    }
}