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

export function createActor(props, /*xOffset, zOffset*/) {
    const pos = props.pos;
    const actor = {
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0] /* + xOffset * 2 */, pos[1], pos[2] /* + zOffset * 2 */),
            orientation: new THREE.Quaternion(),
            euler: new THREE.Vector3()
        }
    };
    actor.reloadModel = true;

    actor.physics.euler.y = getRotation(actor.angle, 0, 1) - 90;

    const euler = new THREE.Euler(THREE.Math.degToRad(actor.physics.euler.x), 
                                  THREE.Math.degToRad(actor.physics.euler.y), 
                                  THREE.Math.degToRad(actor.physics.euler.z), 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    actor.update = function (time) {
        if (actor.isVisible() && 
           !actor.isSprite() && 
            actor.reloadModel) { // only load new model if need reload
            actor.load(actor.index, (threeObject, models) => {
                actor.threeObject = threeObject;
                //currentScene.threeScene.add(threeObject);
            });
        }
        if(actor.currentScene.models && actor.currentScene.models.entities) {
            updateModel(actor.currentScene.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, time);
        }
    };

    actor.load = function (index, callback) {
        loadModel(actor.currentScene.models, index, actor.entityIndex, actor.bodyIndex, actor.animIndex, (obj) => {
            actor.threeObject = obj.meshes[index];
            actor.threeObject.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
            actor.threeObject.quaternion.copy(actor.physics.orientation);
            callback(actor.threeObject, obj);
        });
        actor.reloadModel = false;
    };

    actor.isVisible = !(props.staticFlags & ACTOR_STATIC_FLAG.HIDDEN) && actor.life > 0;
    actor.isSprite = props.staticFlags & ACTOR_STATIC_FLAG.SPRITE;
    return actor;
}
