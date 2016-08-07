import {map, each} from 'lodash';
import {Movement, Target} from './hero';

export function processPhysicsFrame(scene, camera, heroPhysics) {
    switch (heroPhysics.movement) {
        case Movement.NORMAL:
            processNormalMovement(scene, heroPhysics.location);
            break;
    }

    each(heroPhysics.targets, target => {
        switch (target) {
            case Target.CAMERA:
                updateTarget(camera, heroPhysics.location);
                break;
        }
    });
}

function processNormalMovement(scene, location) {
    location.position.y = scene.getGroundHeight(location.position.x, location.position.z) + 0.08;
}

function updateTarget(tgt, src) {
    tgt.position.copy(src.position);
    tgt.quaternion.copy(src.orientation);
    if (src.headOrientation) {
        tgt.quaternion.multiply(src.headOrientation);
    }
}
