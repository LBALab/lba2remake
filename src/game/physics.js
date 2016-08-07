import {map, each} from 'lodash';
import {Movement, Target} from './hero';

export function processPhysicsFrame(scene, camera, heroPhysics) {
    switch (heroPhysics.config.movement) {
        case Movement.NORMAL:
            processNormalMovement(scene, heroPhysics);
            break;
    }

    each(heroPhysics.config.targets, target => {
        switch (target) {
            case Target.CAMERA:
                updateTarget(camera, heroPhysics);
                break;
        }
    });
}

function processNormalMovement(scene, heroPhysics) {
    heroPhysics.position.y = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z) + 0.08;
}

function updateTarget(tgt, src) {
    tgt.position.copy(src.position);
    tgt.quaternion.copy(src.orientation);
    if (src.headOrientation) {
        tgt.quaternion.multiply(src.headOrientation);
    }
}
