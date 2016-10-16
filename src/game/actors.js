import THREE from 'three';

import {loadModel, updateModel} from '../model';
import {getRotation} from '../utils/lba';

const ACTOR_STATIC_FLAG = {
    NONE             : 0,
    COLLIDE_WITH_OBJ : 1,
    // TODO
    HIDDEN           : 0x200,
    SPRITE           : 0x400
    // TODO
};

// TODO: move scetion offset to container THREE.Object3D
export function loadActor(props, callback) {
    const pos = props.pos;
    const actor = {
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2]),
            orientation: new THREE.Quaternion(),
            euler: new THREE.Vector3()
        }
    };

    actor.physics.euler.y = getRotation(props.angle, 0, 1) - 90;

    const euler = new THREE.Euler(THREE.Math.degToRad(actor.physics.euler.x), 
                                  THREE.Math.degToRad(actor.physics.euler.y), 
                                  THREE.Math.degToRad(actor.physics.euler.z), 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    actor.update = function (time) {
        updateModel(actor.model, time);
    };

    actor.isVisible = !(props.staticFlags & ACTOR_STATIC_FLAG.HIDDEN) && actor.life > 0;
    actor.isSprite = props.staticFlags & ACTOR_STATIC_FLAG.SPRITE;

    loadModel(actor.entityIndex, actor.bodyIndex, actor.animIndex, (model) => {
        actor.model = model;
        actor.threeObject = model.mesh;
        actor.threeObject.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
        actor.threeObject.quaternion.copy(actor.physics.orientation);
        callback(null, actor);
    });
}
