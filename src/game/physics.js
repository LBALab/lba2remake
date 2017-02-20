import THREE from 'three';

export function processPhysicsFrame(game, scene, time) {
    const hero = scene.getActor(0);
    processActorPhysics(hero, scene, time);
}

function processActorPhysics(actor, scene, time) {
    if (scene.isIsland) {
        const position = new THREE.Vector3();
        position.applyMatrix4(actor.threeObject.matrixWorld);
        const height = scene.scenery.physics.getGroundHeight(position.x, position.z);
        actor.physics.position.y = height;
        actor.threeObject.position.y = height;
    }
}


